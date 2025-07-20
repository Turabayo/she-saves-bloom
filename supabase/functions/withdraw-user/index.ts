import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

async function getAccessToken() {
  const userId = Deno.env.get('DISB_API_USER')
  const apiKey = Deno.env.get('DISB_API_KEY') // base64 encoded!
  const subscriptionKey = Deno.env.get('DISB_SUBSCRIPTION_KEY')

  console.log('Getting access token with:', { 
    userId, 
    apiKeyLength: apiKey?.length,
    subscriptionKeyLength: subscriptionKey?.length 
  })

  const res = await fetch('https://sandbox.momodeveloper.mtn.com/disbursement/token/', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${apiKey}`,
      'Ocp-Apim-Subscription-Key': subscriptionKey!
    }
  })

  console.log('Access token response status:', res.status)
  const data = await res.json()
  console.log('Access token response data:', data)
  
  if (!res.ok) {
    console.error('Failed to get access token:', data)
    throw new Error(`Token request failed: ${res.status} - ${JSON.stringify(data)}`)
  }
  
  return data.access_token
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Withdraw user request received');
    
    const body = await req.json()
    const { user_id, amount, phone_number } = body

    console.log('Request data:', { user_id, amount, phone_number });

    if (!user_id || !amount || !phone_number) {
      console.error('Missing required fields');
      return new Response('Missing required fields', { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    const referenceId = crypto.randomUUID()
    const subscriptionKey = Deno.env.get('DISB_SUBSCRIPTION_KEY')
    const accessToken = await getAccessToken()
    const momoUrl = `https://sandbox.momodeveloper.mtn.com/disbursement/v1_0/transfer`

    console.log('MTN MoMo URL:', momoUrl);
    console.log('Reference ID:', referenceId);

    const payload = {
      amount: amount.toString(),
      currency: 'EUR',
      externalId: user_id,
      payee: {
        partyIdType: 'MSISDN',
        partyId: phone_number
      },
      payerMessage: 'Withdraw from SheSaves',
      payeeNote: 'Thank you for using SheSaves!'
    }

    console.log('MoMo payload:', payload);

    console.log('Using access token:', accessToken ? `${accessToken.substring(0, 10)}...` : 'NO TOKEN');
    console.log('Transfer headers:', {
      'Authorization': `Bearer ${accessToken}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': 'sandbox',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/json'
    });

    const momoResponse = await fetch(momoUrl, {
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

    console.log('MoMo response status:', momoResponse.status);
    
    if (!momoResponse.ok) {
      const errorText = await momoResponse.text();
      console.error('MoMo transfer error response:', errorText);
      console.error('MoMo response headers:', Object.fromEntries(momoResponse.headers.entries()));
    }
    
    const status = momoResponse.status === 202 ? 'PENDING' : 'FAILED'

    // Insert withdrawal record
    const { data: withdrawal, error: insertError } = await supabase
      .from('withdrawals')
      .insert({
        user_id,
        amount,
        currency: 'RWF',
        phone_number,
        external_id: user_id,
        momo_reference_id: referenceId,
        status,
        payer_message: payload.payerMessage,
        payee_note: payload.payeeNote
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to record withdrawal' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    console.log('Withdrawal record created:', withdrawal);

    return new Response(JSON.stringify({ 
      message: 'Withdrawal initiated', 
      status,
      referenceId,
      withdrawal
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })

  } catch (err) {
    console.error('Withdraw Error:', err)
    return new Response(JSON.stringify({ error: 'Internal Error', details: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
})