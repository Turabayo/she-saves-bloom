
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
  const apiKey = Deno.env.get('DISB_API_KEY')
  const subscriptionKey = Deno.env.get('DISB_SUBSCRIPTION_KEY')
  
  // Use the specific Disbursement Token UUID as per requirements
  const disbursementTokenUUID = '701ea609-aaed-4188-bd90-b3572629ed5b'

  console.log('=== ACCESS TOKEN REQUEST ===')
  console.log('User ID:', userId)
  console.log('API Key length:', apiKey?.length)
  console.log('Subscription Key length:', subscriptionKey?.length)
  console.log('Using Disbursement Token UUID:', disbursementTokenUUID)
  
  // Create base64 encoded credentials (userId:apiKey)
  const credentials = `${userId}:${apiKey}`
  const base64Credentials = btoa(credentials)
  
  console.log('Credentials format:', `${userId}:${apiKey?.substring(0, 8)}...`)
  console.log('Base64 credentials length:', base64Credentials.length)

  const tokenUrl = 'https://sandbox.momodeveloper.mtn.com/disbursement/token/'
  console.log('Token URL:', tokenUrl)

  const headers = {
    'Authorization': `Basic ${base64Credentials}`,
    'Ocp-Apim-Subscription-Key': subscriptionKey!,
    'X-Reference-Id': disbursementTokenUUID
  }
  
  console.log('Token request headers:', {
    'Authorization': `Basic ${base64Credentials.substring(0, 20)}...`,
    'Ocp-Apim-Subscription-Key': subscriptionKey,
    'X-Reference-Id': disbursementTokenUUID
  })

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers
  })

  console.log('=== ACCESS TOKEN RESPONSE ===')
  console.log('Response status:', res.status)
  console.log('Response statusText:', res.statusText)
  console.log('Response headers:', Object.fromEntries(res.headers.entries()))
  
  const responseText = await res.text()
  console.log('Raw response:', responseText)
  
  let data
  try {
    data = JSON.parse(responseText)
    console.log('Parsed response data:', data)
  } catch (e) {
    console.error('Failed to parse response as JSON:', e)
    throw new Error(`Invalid JSON response: ${responseText}`)
  }
  
  if (!res.ok) {
    console.error('=== TOKEN REQUEST FAILED ===')
    console.error('Status:', res.status)
    console.error('Response:', data)
    throw new Error(`Token request failed: ${res.status} - ${JSON.stringify(data)}`)
  }
  
  if (!data.access_token) {
    console.error('No access token in response:', data)
    throw new Error('No access token received')
  }
  
  console.log('Access token received (first 10 chars):', data.access_token.substring(0, 10) + '...')
  return data.access_token
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== WITHDRAW USER REQUEST ===');
    
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
    
    console.log('Generated reference ID:', referenceId)
    console.log('Using subscription key for transfer:', subscriptionKey)

    // Get access token with enhanced debugging
    const accessToken = await getAccessToken()

    const momoUrl = `https://sandbox.momodeveloper.mtn.com/disbursement/v1_0/transfer`
    console.log('=== TRANSFER REQUEST ===')
    console.log('Transfer URL:', momoUrl);

    const payload = {
      amount: amount.toString(),
      currency: 'RWF',
      externalId: user_id,
      payee: {
        partyIdType: 'MSISDN',
        partyId: phone_number
      },
      payerMessage: 'SheSaves withdrawal',
      payeeNote: 'Thank you for using SheSaves!'
    }

    console.log('Transfer payload:', JSON.stringify(payload, null, 2));

    const transferHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': 'sandbox',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/json'
    }

    console.log('Transfer headers:', {
      'Authorization': `Bearer ${accessToken.substring(0, 10)}...`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': 'sandbox',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/json'
    });

    const momoResponse = await fetch(momoUrl, {
      method: 'POST',
      headers: transferHeaders,
      body: JSON.stringify(payload)
    })

    console.log('=== TRANSFER RESPONSE ===')
    console.log('Transfer response status:', momoResponse.status);
    console.log('Transfer response statusText:', momoResponse.statusText);
    console.log('Transfer response headers:', Object.fromEntries(momoResponse.headers.entries()));
    
    if (!momoResponse.ok) {
      const errorText = await momoResponse.text();
      console.error('=== TRANSFER FAILED ===');
      console.error('Error response body:', errorText);
      
      // Try to parse error as JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error:', errorJson);
      } catch (e) {
        console.error('Error response is not JSON');
      }
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

    // Send SMS notification for withdrawal initiation
    try {
      const smsMessage = status === 'PENDING' 
        ? `⚠️ Your SheSaves withdrawal of ${amount} RWF is being processed. You will receive confirmation shortly.`
        : `❌ Your SheSaves withdrawal of ${amount} RWF failed. Please try again or contact support.`;
      
      const smsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          phoneNumber: phone_number,
          message: smsMessage,
        }),
      });

      if (smsResponse.ok) {
        console.log('✅ SMS notification sent successfully');
      } else {
        console.error('Failed to send SMS notification:', await smsResponse.text());
      }
    } catch (smsError) {
      console.error('Error sending SMS notification:', smsError);
      // Don't fail the withdrawal for SMS errors
    }

    console.log('=== REQUEST COMPLETED ===');

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
    console.error('=== WITHDRAW ERROR ===')
    console.error('Error details:', err)
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    return new Response(JSON.stringify({ error: 'Internal Error', details: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
})
