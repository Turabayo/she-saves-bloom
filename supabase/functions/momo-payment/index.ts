import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

// MTN MoMo Sandbox Configuration - Updated token and expiry
const MOMO_CONFIG = {
  baseUrl: 'https://sandbox.momodeveloper.mtn.com',
  subscriptionKey: 'e088d79cb68442d6b631a1783d1fd5be',
  authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSMjU2In0.eyJjbGllbnRJZCI6IjIzYTU3NzhkLThkZTAtNGZkMS1hYTU3LThhMzcxYjEwOWE5YSIsImV4cGlyZXMiOiIyMDI1LTA3LTEwVDAwOjAzOjAzLjMzNSIsInNlc3Npb25JZCI6ImExYzI3OTIzLTg3NTctNGM2Zi05NzM3LTljNDM5OWMyYjU2MyJ9.gyvxO1s77bbRcoP_eRv32HMweSs3fRhOaDPxuG-TvepQBG52V3y6skMyPlMj8F0iyzI9J5X8xWey_VUXp4cW5HO34U0OmVHrUxasDKOAg4tExxFXxhKQz5UtNfbvettNF0JX1A21w9iGj1eCysExA7-K1k2M9g7GeB4t_KNmaDQ7HsFr3timiDrldTryM710s29UuYIN_JCWwRKKiVrdiDD-HYINrD0qMKqHygLQOX4BjYk4P8HMWvJ_wQmtkL7JfwF379HYnMhUFuq3WMwm3cqN34QEmUVOP2CzIzY_f0LTrKTZmrfT4nEcBZCUiBs9m9RYFuTFPjDOqNhKbmsIBw',
  currency: 'EUR',
  targetEnvironment: 'sandbox',
  externalId: '123456789',
  testPayerId: '46733123454'
}

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Sanitize phone number - always use test number for sandbox
function sanitizePhone(rawPhone: string): string {
  // Remove spaces, + and country code for processing
  const cleaned = rawPhone.replace(/[\s+]/g, '').replace(/^250/, '');
  // Always return test payer ID for sandbox
  return MOMO_CONFIG.testPayerId;
}

// Initiate payment with MTN MoMo
async function initiatePayment(phone: string, amount: number): Promise<{ success: boolean; referenceId?: string; error?: string }> {
  const referenceId = generateUUID();
  const sanitizedPhone = sanitizePhone(phone);
  
  console.log(`=== MoMo Payment Initiation ===`);
  console.log(`Amount: ${amount} ${MOMO_CONFIG.currency}`);
  console.log(`Original phone: ${phone}`);
  console.log(`Sanitized phone: ${sanitizedPhone}`);
  console.log(`Reference ID: ${referenceId}`);

  const requestBody = {
    amount: amount.toString(),
    currency: MOMO_CONFIG.currency,
    externalId: MOMO_CONFIG.externalId,
    payer: {
      partyIdType: 'MSISDN',
      partyId: MOMO_CONFIG.testPayerId
    },
    payerMessage: 'Top-up from SheSaves',
    payeeNote: 'Thank you for using SheSaves'
  };

  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  const headers = {
    'X-Reference-Id': referenceId,
    'X-Target-Environment': MOMO_CONFIG.targetEnvironment,
    'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey,
    'Authorization': MOMO_CONFIG.authorization,
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
    
    if (response.status === 202) {
      console.log(`✅ Payment initiated successfully with reference ID: ${referenceId}`);
      return { success: true, referenceId };
    } else {
      const responseText = await response.text();
      console.error(`❌ Payment initiation failed: ${response.status} - ${responseText}`);
      return { 
        success: false, 
        error: `Payment failed with status ${response.status}: ${responseText}` 
      };
    }

  } catch (error: unknown) {
    console.error('❌ Network error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { 
      success: false, 
      error: `Network error: ${errorMessage}` 
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

    // Initiate payment
    const paymentResult = await initiatePayment(phone, amount);
    
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