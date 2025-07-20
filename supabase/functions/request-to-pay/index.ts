
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

async function getAccessToken() {
  const apiUser = Deno.env.get('COLL_API_USER')!
  const apiKey = Deno.env.get('COLL_API_KEY')!
  const subscriptionKey = Deno.env.get('COLL_SUBSCRIPTION_KEY')!

  // Combine API User and API Key for Basic Auth
  const credentials = btoa(`${apiUser}:${apiKey}`)
  
  console.log('Getting access token with API User:', apiUser)

  const res = await fetch('https://sandbox.momodeveloper.mtn.com/collection/token/', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': subscriptionKey
    }
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Token request failed:', res.status, errorText)
    throw new Error(`Failed to get access token: ${res.status}`)
  }

  const data = await res.json()
  console.log('Access token obtained successfully')
  return data.access_token
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, amount, phone_number } = await req.json()
    
    console.log('Top-up request:', { user_id, amount, phone_number });

    if (!user_id || !amount || !phone_number) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, amount, phone_number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate environment variables
    const requiredEnvVars = ['COLL_API_USER', 'COLL_API_KEY', 'COLL_SUBSCRIPTION_KEY']
    for (const envVar of requiredEnvVars) {
      if (!Deno.env.get(envVar)) {
        console.error(`Missing environment variable: ${envVar}`)
        return new Response(
          JSON.stringify({ error: `Configuration error: Missing ${envVar}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const referenceId = crypto.randomUUID()
    const subscriptionKey = Deno.env.get('COLL_SUBSCRIPTION_KEY')!

    console.log('Generated reference ID:', referenceId);

    let accessToken
    try {
      accessToken = await getAccessToken()
    } catch (error) {
      console.error('Failed to get access token:', error)
      return new Response(
        JSON.stringify({ error: 'Authentication failed with MTN MoMo API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload = {
      amount: amount.toString(),
      currency: 'EUR', // MoMo sandbox supports only EUR
      externalId: user_id,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phone_number
      },
      payerMessage: 'Top-up SheSaves',
      payeeNote: 'Saving money is smart!'
    }

    console.log('MTN MoMo payload:', payload);

    const momoRes = await fetch('https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': 'sandbox',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    console.log('MTN MoMo response status:', momoRes.status);

    if (!momoRes.ok) {
      const errorText = await momoRes.text()
      console.error('MTN MoMo API error:', momoRes.status, errorText)
    }

    const status = momoRes.status === 202 ? 'PENDING' : 'FAILED'

    // Insert into topups table with currency field
    const { error: insertError } = await supabase.from('topups').insert({
      user_id,
      amount,
      currency: 'EUR',
      phone_number,
      external_id: user_id,
      momo_reference_id: referenceId,
      status,
      payer_message: payload.payerMessage,
      payee_note: payload.payeeNote
    })

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save top-up record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Top-up record saved successfully');

    if (momoRes.status === 202) {
      return new Response(
        JSON.stringify({ 
          message: 'Top-up initiated successfully', 
          referenceId, 
          status: 'PENDING',
          success: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      const errorText = await momoRes.text()
      return new Response(
        JSON.stringify({ 
          error: `MTN MoMo API error: ${momoRes.status} - ${errorText}`,
          referenceId,
          status: 'FAILED',
          success: false
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (err) {
    console.error('Top-up Error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
