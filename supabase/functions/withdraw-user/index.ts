
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
  
  console.log('=== DISBURSEMENT API CONFIGURATION ===')
  console.log('Using Disbursement API User:', userId)
  console.log('API Key available:', !!apiKey)
  console.log('Subscription Key available:', !!subscriptionKey)
  
  if (!userId || !apiKey || !subscriptionKey) {
    console.error('Missing disbursement API credentials:', {
      hasUserId: !!userId,
      hasApiKey: !!apiKey,
      hasSubscriptionKey: !!subscriptionKey
    })
    throw new Error('Disbursement API credentials not configured')
  }
  
  console.log('=== ACCESS TOKEN REQUEST ===')
  
  // Create base64 encoded credentials (userId:apiKey)
  const credentials = `${userId}:${apiKey}`
  const base64Credentials = btoa(credentials)
  
  console.log('Credentials format valid:', credentials.includes(':'))
  console.log('Base64 credentials length:', base64Credentials.length)

  const tokenUrl = 'https://sandbox.momodeveloper.mtn.com/disbursement/token/'
  console.log('Token URL:', tokenUrl)

  const headers = {
    'Authorization': `Basic ${base64Credentials}`,
    'Ocp-Apim-Subscription-Key': subscriptionKey!,
    'X-Reference-Id': userId
  }
  
  console.log('Token request headers prepared')

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers
  })

  console.log('=== ACCESS TOKEN RESPONSE ===')
  console.log('Response status:', res.status)
  console.log('Response statusText:', res.statusText)
  
  const responseText = await res.text()
  console.log('Raw response:', responseText)
  
  let data
  try {
    data = JSON.parse(responseText)
    console.log('Parsed response data:', data)
  } catch (e) {
    console.error('Failed to parse response as JSON:', e)
    throw new Error(`Invalid JSON response from token endpoint: ${responseText}`)
  }
  
  if (!res.ok) {
    console.error('=== TOKEN REQUEST FAILED ===')
    console.error('Status:', res.status)
    console.error('Response:', data)
    throw new Error(`Token request failed: ${res.status} - ${JSON.stringify(data)}`)
  }
  
  if (!data.access_token) {
    console.error('No access token in response:', data)
    throw new Error('No access token received from MTN API')
  }
  
  console.log('✅ Access token received successfully')
  return data.access_token
}

async function sendSMSNotification(phoneNumber: string, message: string) {
  try {
    console.log('=== SENDING SMS NOTIFICATION ===')
    
    // Format phone number for SMS (ensure it starts with +250 for Rwanda)
    let formattedPhone = phoneNumber
    if (!formattedPhone.startsWith('+')) {
      // If phone starts with 07/08, replace with +2507/+2508
      if (formattedPhone.startsWith('07') || formattedPhone.startsWith('08')) {
        formattedPhone = '+25' + formattedPhone
      } else if (formattedPhone.startsWith('25')) {
        formattedPhone = '+' + formattedPhone
      } else if (formattedPhone.startsWith('0')) {
        formattedPhone = '+250' + formattedPhone.substring(1)
      } else {
        formattedPhone = '+250' + formattedPhone
      }
    }
    
    console.log('Original phone:', phoneNumber)
    console.log('Formatted phone:', formattedPhone)
    console.log('SMS message:', message)
    
    const smsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        message: message,
      }),
    })

    const smsResult = await smsResponse.text()
    console.log('SMS API response status:', smsResponse.status)
    console.log('SMS API response body:', smsResult)

    if (smsResponse.ok) {
      console.log('✅ SMS notification sent successfully')
      return true
    } else {
      console.error('❌ Failed to send SMS notification. Status:', smsResponse.status)
      console.error('❌ SMS error response:', smsResult)
      return false
    }
  } catch (smsError) {
    console.error('❌ Exception in SMS sending:', smsError)
    return false
  }
}

serve(async (req) => {
  console.log('=== WITHDRAW FUNCTION CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== WITHDRAW USER REQUEST START ===');
    
    const body = await req.json()
    const { user_id, amount, phone_number } = body

    console.log('Request data:', { user_id, amount, phone_number });

    if (!user_id || !amount || !phone_number) {
      console.error('Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    const referenceId = crypto.randomUUID()
    const subscriptionKey = Deno.env.get('DISB_SUBSCRIPTION_KEY')
    
    console.log('Generated reference ID:', referenceId)

    // Get access token with enhanced debugging
    console.log('🔑 Getting access token...')
    const accessToken = await getAccessToken()
    console.log('✅ Access token obtained')

    const momoUrl = `https://sandbox.momodeveloper.mtn.com/disbursement/v1_0/transfer`
    console.log('=== TRANSFER REQUEST ===')
    console.log('Transfer URL:', momoUrl);

    // IMPORTANT: Use EUR for sandbox environment, RWF for production
    const isProduction = Deno.env.get('ENVIRONMENT') === 'production'
    const currency = isProduction ? 'RWF' : 'EUR'
    
    console.log('Environment:', isProduction ? 'production' : 'sandbox')
    console.log('Currency being used:', currency)
    
    // Convert amount to EUR for sandbox if needed
    let transferAmount = amount
    if (!isProduction && currency === 'EUR') {
      // Convert RWF to EUR for sandbox (approximate rate: 1 EUR = 1200 RWF)
      transferAmount = Math.round(amount / 1200)
      console.log(`Converting ${amount} RWF to ${transferAmount} EUR for sandbox`)
    }
    
    const payload = {
      amount: transferAmount.toString(),
      currency: currency,
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

    console.log('Transfer headers prepared')

    const momoResponse = await fetch(momoUrl, {
      method: 'POST',
      headers: transferHeaders,
      body: JSON.stringify(payload)
    })

    console.log('=== TRANSFER RESPONSE ===')
    console.log('Transfer response status:', momoResponse.status);
    console.log('Transfer response statusText:', momoResponse.statusText);
    
    // Get response body for logging
    const responseText = await momoResponse.text()
    console.log('Transfer response body:', responseText);
    
    if (!momoResponse.ok) {
      console.error('=== TRANSFER FAILED ===');
      console.error('HTTP Status:', momoResponse.status);
      console.error('Status Text:', momoResponse.statusText);
      console.error('Error response body:', responseText);
      
      // Try to parse error as JSON for better error details
      let errorDetails = responseText
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson
        console.error('Parsed error details:', errorJson);
      } catch (e) {
        console.error('Error response is not valid JSON');
      }
      
      // Send failure SMS notification
      const failureMessage = `❌ Your SheSaves withdrawal of ${amount} RWF failed. Error: ${momoResponse.status}. Please try again or contact support.`
      await sendSMSNotification(phone_number, failureMessage)
      
      // Return detailed error information
      return new Response(JSON.stringify({ 
        error: 'transfer_failed', 
        details: errorDetails,
        status: momoResponse.status,
        statusText: momoResponse.statusText,
        currency_used: currency,
        amount_sent: transferAmount,
        reference_id: referenceId
      }), { 
        status: momoResponse.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }
    
    console.log('✅ Transfer request accepted by MTN')
    const status = momoResponse.status === 202 ? 'PENDING' : 'FAILED'

    // Insert withdrawal record
    const { data: withdrawal, error: insertError } = await supabase
      .from('withdrawals')
      .insert({
        user_id,
        amount,
        currency: 'RWF', // Always store as RWF in database
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

    console.log('✅ Withdrawal record created:', withdrawal);

    // Insert into transactions table for transaction history
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id,
        amount,
        type: 'withdrawal',
        method: 'momo',
        status: status.toLowerCase()
      })

    if (transactionError) {
      console.error('Failed to insert transaction:', transactionError)
    } else {
      console.log('✅ Transaction history updated')
    }

    // Send SMS notification
    const smsMessage = status === 'PENDING' 
      ? `⚠️ Your SheSaves withdrawal of ${amount} RWF is being processed. You will receive confirmation shortly. Reference: ${referenceId.substring(0, 8)}`
      : `❌ Your SheSaves withdrawal of ${amount} RWF failed. Please try again or contact support.`
    
    console.log('📱 Sending SMS notification...')
    const smsSuccess = await sendSMSNotification(phone_number, smsMessage)
    
    if (!smsSuccess) {
      console.warn('⚠️ SMS notification failed but withdrawal was processed')
    }

    console.log('=== WITHDRAWAL REQUEST COMPLETED ===');

    return new Response(JSON.stringify({ 
      message: 'Withdrawal initiated', 
      status,
      referenceId,
      withdrawal,
      currency_converted: !isProduction ? `${amount} RWF → ${transferAmount} EUR` : 'none',
      sms_sent: smsSuccess
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })

  } catch (err) {
    console.error('=== WITHDRAW ERROR ===')
    console.error('Error type:', err.constructor.name)
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    
    // Send failure SMS if we have phone number
    try {
      const body = await req.clone().json()
      if (body.phone_number && body.amount) {
        const errorMessage = `❌ Your SheSaves withdrawal of ${body.amount} RWF failed due to a system error. Please try again later or contact support.`
        await sendSMSNotification(body.phone_number, errorMessage)
      }
    } catch (smsErr) {
      console.error('Failed to send error SMS:', smsErr)
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal Error', 
      details: err.message,
      type: err.constructor.name
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
})
