
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
  
  // Create base64 encoded credentials exactly as MTN expects: userId:apiKey
  const credentials = `${userId}:${apiKey}`
  const base64Credentials = btoa(credentials)
  
  console.log('Credentials format valid:', credentials.includes(':'))
  console.log('Base64 credentials created successfully')

  const tokenUrl = 'https://sandbox.momodeveloper.mtn.com/disbursement/token/'
  console.log('Token URL:', tokenUrl)

  // Construct headers exactly as per MTN API documentation
  const headers = {
    'Authorization': `Basic ${base64Credentials}`,
    'Ocp-Apim-Subscription-Key': subscriptionKey,
    'X-Reference-Id': userId,
    'Content-Type': 'application/json'
  }
  
  console.log('Token request headers constructed:')
  console.log('- Authorization: Basic [HIDDEN]')
  console.log('- Ocp-Apim-Subscription-Key: [HIDDEN]')
  console.log('- X-Reference-Id:', userId)
  console.log('- Content-Type: application/json')

  try {
    console.log('Sending token request to MTN API...')
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
      console.log('Parsed response data available')
    } catch (e) {
      console.error('Failed to parse response as JSON:', e)
      throw new Error(`Invalid JSON response from token endpoint: ${responseText}`)
    }
    
    if (!res.ok) {
      console.error('=== TOKEN REQUEST FAILED ===')
      console.error('Status:', res.status)
      console.error('Error details:', data)
      
      // Provide specific error messages for common issues
      if (res.status === 401) {
        throw new Error(`Authentication failed: Invalid credentials or subscription key. Status: ${res.status}`)
      } else if (res.status === 400) {
        throw new Error(`Bad request: Check API user ID and request format. Status: ${res.status}`)
      } else {
        throw new Error(`Token request failed: ${res.status} - ${JSON.stringify(data)}`)
      }
    }
    
    if (!data.access_token) {
      console.error('No access token in response:', data)
      throw new Error('No access token received from MTN API')
    }
    
    console.log('✅ Access token received successfully')
    console.log('Token type:', data.token_type)
    console.log('Token expires in:', data.expires_in, 'seconds')
    return data.access_token
  } catch (error) {
    console.error('Token request error:', error)
    throw error
  }
}

async function sendSMSNotification(phoneNumber: string, message: string) {
  try {
    console.log('=== SENDING SMS NOTIFICATION ===')
    
    // Format phone number for SMS (ensure it starts with +250 for Rwanda)
    let formattedPhone = phoneNumber
    if (!formattedPhone.startsWith('+')) {
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
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        success: false 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    const referenceId = crypto.randomUUID()
    const subscriptionKey = Deno.env.get('DISB_SUBSCRIPTION_KEY')
    
    console.log('Generated reference ID:', referenceId)

    // Get access token with proper error handling
    console.log('🔑 Getting access token...')
    const accessToken = await getAccessToken()
    console.log('✅ Access token obtained successfully')

    const momoUrl = `https://sandbox.momodeveloper.mtn.com/disbursement/v1_0/transfer`
    console.log('=== TRANSFER REQUEST ===')
    console.log('Transfer URL:', momoUrl);

    // Convert amount to EUR for sandbox (approximate rate: 1 EUR = 1200 RWF)
    const currency = 'EUR'
    const transferAmount = Math.max(1, Math.round(amount / 1200))
    console.log(`Converting ${amount} RWF to ${transferAmount} EUR for sandbox`)
    
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
      'Ocp-Apim-Subscription-Key': subscriptionKey!,
      'Content-Type': 'application/json'
    }

    console.log('Transfer headers constructed:')
    console.log('- Authorization: Bearer [HIDDEN]')
    console.log('- X-Reference-Id:', referenceId)
    console.log('- X-Target-Environment: sandbox')
    console.log('- Ocp-Apim-Subscription-Key: [HIDDEN]')
    console.log('- Content-Type: application/json')

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
    
    let status = 'FAILED'
    let smsMessage = ''
    let withdrawalProcessed = false
    
    if (momoResponse.status === 202) {
      status = 'PENDING'
      withdrawalProcessed = true
      smsMessage = `✅ Your SheSaves withdrawal of ${amount} RWF is being processed. You will receive confirmation shortly. Reference: ${referenceId.substring(0, 8)}`
      console.log('✅ Transfer request accepted by MTN (202)')
    } else {
      console.error('=== TRANSFER FAILED ===');
      console.error('HTTP Status:', momoResponse.status);
      console.error('Status Text:', momoResponse.statusText);
      console.error('Error response body:', responseText);
      
      smsMessage = `❌ Your SheSaves withdrawal of ${amount} RWF failed. Error: ${momoResponse.status}. Please try again or contact support.`
    }

    // Insert withdrawal record regardless of success/failure for audit trail
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
    } else {
      console.log('✅ Withdrawal record created:', withdrawal);
    }

    // Insert into transactions table for transaction history
    if (!insertError) {
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
    }

    // Send SMS notification
    console.log('📱 Executing SMS notification after MoMo response...')
    const smsSuccess = await sendSMSNotification(phone_number, smsMessage)
    
    if (!smsSuccess) {
      console.warn('⚠️ SMS notification failed but withdrawal was ' + (withdrawalProcessed ? 'processed' : 'attempted'))
    }

    console.log('=== WITHDRAWAL REQUEST COMPLETED ===');

    if (withdrawalProcessed) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Withdrawal initiated successfully', 
        status,
        referenceId,
        withdrawal,
        currency_converted: `${amount} RWF → ${transferAmount} EUR`,
        sms_sent: smsSuccess
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    } else {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'transfer_failed', 
        details: responseText,
        status: momoResponse.status,
        statusText: momoResponse.statusText,
        currency_used: currency,
        amount_sent: transferAmount,
        reference_id: referenceId,
        sms_sent: smsSuccess
      }), { 
        status: 200, // Return 200 so frontend can parse the error
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

  } catch (err) {
    console.error('=== WITHDRAW ERROR ===')
    console.error('Error type:', err.constructor.name)
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal Error', 
      details: err.message,
      type: err.constructor.name
    }), { 
      status: 200, // Return 200 so frontend can parse the error
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
})
