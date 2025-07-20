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
  const apiKey = Deno.env.get('COLL_API_KEY')!
  const subscriptionKey = Deno.env.get('COLL_SUBSCRIPTION_KEY')!

  const res = await fetch('https://sandbox.momodeveloper.mtn.com/collection/token/', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${apiKey}`,
      'Ocp-Apim-Subscription-Key': subscriptionKey
    }
  })

  const data = await res.json()
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

    const referenceId = crypto.randomUUID()
    const subscriptionKey = Deno.env.get('COLL_SUBSCRIPTION_KEY')!
    const accessToken = await getAccessToken()

    console.log('Generated reference ID:', referenceId);

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

    const status = momoRes.status === 202 ? 'PENDING' : 'FAILED'

    // Insert into topups table
    const { error: insertError } = await supabase.from('topups').insert({
      user_id,
      amount,
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

    return new Response(
      JSON.stringify({ 
        message: 'Top-up initiated', 
        referenceId, 
        status,
        success: momoRes.status === 202
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Top-up Error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})