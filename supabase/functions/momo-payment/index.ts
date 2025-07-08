
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

// MTN MoMo Sandbox Configuration
const MOMO_CONFIG = {
  baseUrl: 'https://sandbox.momodeveloper.mtn.com',
  subscriptionKey: 'e088d79cb68442d6b631a1783d1fd5be',
  targetEnvironment: 'sandbox',
  currency: 'EUR',
  apiUserId: '780c177b-fdcf-4c9f-8a51-499ee395574f',
  apiKey: 'fe085ed5b4034d7da99b58bc6e8c4f03'
}

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Sanitize phone number - force test number for sandbox
function sanitizePhone(rawPhone: string): string {
  // Always use the test number for sandbox
  return "0780000000";
}

// Get new access token
async function getAccessToken(): Promise<{ success: boolean; token?: string; error?: string }> {
  console.log('=== Getting New Access Token ===');
  
  try {
    const response = await fetch(`${MOMO_CONFIG.baseUrl}/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${MOMO_CONFIG.apiUserId}:${MOMO_CONFIG.apiKey}`)}`,
        'X-Target-Environment': MOMO_CONFIG.targetEnvironment,
        'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Token request status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token request failed:', errorText);
      return { success: false, error: `Token request failed: ${response.status}` };
    }

    const tokenData = await response.json();
    console.log('Token received successfully');
    
    return { 
      success: true, 
      token: `Bearer ${tokenData.access_token}`,
    };

  } catch (error) {
    console.error('Error getting access token:', error);
    return { success: false, error: `Network error: ${error.message}` };
  }
}

// Initiate payment with MTN MoMo
async function initiatePayment(phone: string, amount: number, accessToken: string): Promise<{ success: boolean; referenceId?: string; error?: string }> {
  const referenceId = generateUUID();
  const sanitizedPhone = sanitizePhone(phone);
  
  console.log(`=== MoMo Payment Initiation ===`);
  console.log(`Amount: ${amount} ${MOMO_CONFIG.currency}`);
  console.log(`Original phone: ${phone}`);
  console.log(`Sanitized phone: ${sanitizedPhone}`);
  console.log(`Reference ID: ${referenceId}`);
  console.log(`Using token: ${accessToken.substring(0, 20)}...`);

  const requestBody = {
    amount: amount.toString(),
    currency: MOMO_CONFIG.currency,
    externalId: referenceId,
    payer: {
      partyIdType: 'MSISDN',
      partyId: sanitizedPhone
    },
    payerMessage: 'Top-up from SheSaves',
    payeeNote: 'Thank you for using SheSaves'
  };

  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  const headers = {
    'X-Reference-Id': referenceId,
    'X-Target-Environment': MOMO_CONFIG.targetEnvironment,
    'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey,
    'Authorization': accessToken,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(`${MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    console.log(`=== MoMo API Response ===`);
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`Response body: ${responseText}`);
    
    if (response.status === 202) {
      console.log(`✅ Payment initiated successfully with reference ID: ${referenceId}`);
      return { success: true, referenceId };
    } else {
      console.error(`❌ Payment initiation failed: ${response.status}`);
      return { 
        success: false, 
        error: `Payment failed with status ${response.status}: ${responseText}` 
      };
    }

  } catch (error) {
    console.error('❌ Network error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== MoMo Payment Request Started ===');
    
    // Create Supabase client
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      authHeader ? { global: { headers: { Authorization: authHeader } } } : {}
    );

    // Get the current user for authenticated requests
    let user = null;
    if (authHeader) {
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
      if (!authError && authUser) {
        user = authUser;
      }
    }

    const { amount, phone, transactionId } = await req.json();

    console.log(`Processing Payment: Amount=${amount}, Phone=${phone}, User=${user?.id}, Transaction=${transactionId}`);

    // Validate input
    if (!amount || !phone) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ success: false, error: 'Amount and phone number are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (amount <= 0) {
      console.error('Invalid amount');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid amount. Amount must be greater than 0.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get fresh access token
    const tokenResult = await getAccessToken();
    if (!tokenResult.success) {
      console.error('Failed to get access token:', tokenResult.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Authentication failed: ${tokenResult.error}` 
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initiate payment with fresh token
    const paymentResult = await initiatePayment(phone, amount, tokenResult.token!);
    
    if (!paymentResult.success) {
      console.error('Payment initiation failed:', paymentResult.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: paymentResult.error 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create transaction record
    const transactionData = {
      reference_id: paymentResult.referenceId!,
      external_id: paymentResult.referenceId!,
      amount: amount,
      currency: MOMO_CONFIG.currency,
      phone: sanitizePhone(phone),
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (user) {
      // Create record in momo_transactions table for authenticated users
      const { error: momoError } = await supabaseClient
        .from('momo_transactions')
        .insert([{
          ...transactionData,
          user_id: user.id
        }]);

      if (momoError) {
        console.error('Error creating momo transaction:', momoError);
      }

      // Update existing transaction if provided
      if (transactionId) {
        const { error: updateError } = await supabaseClient
          .from('transactions')
          .update({
            external_id: paymentResult.referenceId,
            reference_id: paymentResult.referenceId,
            status: 'processing'
          })
          .eq('id', transactionId)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating transaction:', updateError);
        }
      }
    }

    console.log(`✅ Payment request successful. Reference: ${paymentResult.referenceId}`);

    return new Response(
      JSON.stringify({
        success: true,
        referenceId: paymentResult.referenceId,
        externalId: paymentResult.referenceId,
        message: 'Payment initiated successfully. Check your phone for the MoMo prompt.',
        amount: amount,
        currency: MOMO_CONFIG.currency,
        phone: sanitizePhone(phone)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ MoMo API error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        details: error.stack || 'No additional details'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
