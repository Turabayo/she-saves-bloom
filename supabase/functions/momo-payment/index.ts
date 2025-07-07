
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
  authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSMjU2In0.eyJjbGllbnRJZCI6Ijc4MGMxNzdiLWZkY2YtNGM5Zi04YTUxLTQ5OWVlMzk1NTc0ZiIsImV4cGlyZXMiOiIyMDI1LTA3LTA1VDE2OjU3OjM4LjMwNCIsInNlc3Npb25JZCI6Ijc2ODk4OWVkLTgzZmEtNGUwMC1hOTkwLTVkMzRjYmEzMDkwNCJ9.aolYOkszNsGdgNWh0xvBbPBqXqdP0xQXZ2lHH_4lTuPPWwwuymd5wjgMcHP8KN3l6fw_kUYA4s0mhBoSbaJ4wuw-jaj1FQDv62WVhoGDDsuELjQdLLulVtIwdGOcjS81hDkh7Hk4xVYEdL2zv7HmkGvoQ0S46gsWTWkB11K9nF2LDCB9rX46iSAkXz_VNAj-9BOKqlB7MBjxpeoiRrvv3OACfKzw248bWQlm5lVQtWM8-XH4mKRNU6fKedv130GhMQIDw-hdx6aBeSrt3Bn273_nwxK07zL6LU05F76y1GR-M6Fy3VVbpXHwaULg0kTcqvuJP1N8exupqpqAUQfDjQ',
  testPayerId: '46733123454',
  externalId: '123456789'
}

interface MoMoPaymentRequest {
  amount: number;
  phone: string;
  transactionId?: string;
}

interface MoMoStatusRequest {
  referenceId: string;
}

interface MoMoWebhookPayload {
  financialTransactionId?: string;
  referenceId: string;
  status: 'SUCCESSFUL' | 'FAILED' | 'REJECTED' | 'TIMEOUT' | 'PENDING';
  reason?: string;
}

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Validate phone number format
function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+?25)?(078|072|073|079)\d{7}$/;
  return phoneRegex.test(phone);
}

// Validate access token (basic check for expiry)
function isTokenValid(token: string): boolean {
  if (!token || !token.startsWith('Bearer ')) {
    return false;
  }
  
  try {
    // Extract JWT payload and check expiry if possible
    const tokenPart = token.replace('Bearer ', '');
    const payload = JSON.parse(atob(tokenPart.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp && payload.exp > currentTime;
  } catch {
    // If we can't parse, assume it's valid for now
    return true;
  }
}

// Initiate payment with MTN MoMo
async function initiatePayment(phone: string, amount: number): Promise<{ success: boolean; referenceId?: string; error?: string }> {
  const referenceId = generateUUID();
  
  console.log(`Initiating MoMo payment: ${amount} ${MOMO_CONFIG.currency} to ${phone}`);
  console.log(`Using reference ID: ${referenceId}`);

  // Validate inputs
  if (!validatePhoneNumber(phone)) {
    return { success: false, error: 'Invalid phone number format. Please use a valid Rwandan number.' };
  }

  if (!isTokenValid(MOMO_CONFIG.authorization)) {
    return { success: false, error: 'Access token is expired or invalid. Please refresh the session.' };
  }

  const requestBody = {
    amount: amount.toString(),
    currency: MOMO_CONFIG.currency,
    externalId: MOMO_CONFIG.externalId,
    payer: {
      partyIdType: 'MSISDN',
      partyId: phone // Use the provided phone number in sandbox
    },
    payerMessage: 'Top-up from SheSaves',
    payeeNote: 'Thank you'
  };

  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(`${MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Authorization': MOMO_CONFIG.authorization,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': MOMO_CONFIG.targetEnvironment,
        'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`MTN MoMo API response status: ${response.status}`);
    
    if (response.status === 202) {
      console.log(`Payment initiated successfully with reference ID: ${referenceId}`);
      return { success: true, referenceId };
    } else {
      const errorText = await response.text();
      console.error('MTN MoMo API error response:', errorText);
      return { 
        success: false, 
        error: `Payment initiation failed: ${response.status} - ${errorText || 'Unknown error'}` 
      };
    }

  } catch (error) {
    console.error('Error initiating payment:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

// Check payment status
async function checkPaymentStatus(referenceId: string): Promise<any> {
  console.log(`Checking payment status for reference ID: ${referenceId}`);

  try {
    const response = await fetch(`${MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
      method: 'GET',
      headers: {
        'Authorization': MOMO_CONFIG.authorization,
        'X-Target-Environment': MOMO_CONFIG.targetEnvironment,
        'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MTN MoMo status check error:', errorText);
      throw new Error(`Status check failed: ${response.status} ${errorText}`);
    }

    const statusData = await response.json();
    console.log(`Payment status for ${referenceId}:`, statusData);
    
    return statusData;

  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}

// Handle webhook notifications
async function handleWebhook(payload: MoMoWebhookPayload, supabaseClient: any) {
  console.log('Processing webhook payload:', payload);

  try {
    const { error } = await supabaseClient
      .from('momo_transactions')
      .update({
        status: payload.status,
        financial_transaction_id: payload.financialTransactionId,
        reason: payload.reason,
        callback_received_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('reference_id', payload.referenceId);

    if (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }

    console.log(`Transaction ${payload.referenceId} updated with status: ${payload.status}`);
    return { success: true };

  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  try {
    // Create Supabase client
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      authHeader ? { global: { headers: { Authorization: authHeader } } } : {}
    );

    // Handle webhook endpoint
    if (pathname.includes('/webhooks/momo') && (req.method === 'POST' || req.method === 'PUT')) {
      console.log('Received webhook notification');
      
      const webhookPayload: MoMoWebhookPayload = await req.json();
      
      await handleWebhook(webhookPayload, supabaseClient);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Handle status check endpoint
    if (pathname.includes('/status') && req.method === 'POST') {
      const { referenceId }: MoMoStatusRequest = await req.json();
      
      if (!referenceId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Reference ID is required' }),
          { 
            status: 400,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      const statusData = await checkPaymentStatus(referenceId);
      
      // Update local database with status
      const { error } = await supabaseClient
        .from('momo_transactions')
        .update({
          status: statusData.status || 'PENDING',
          updated_at: new Date().toISOString()
        })
        .eq('reference_id', referenceId);

      if (error) {
        console.error('Error updating transaction status:', error);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: statusData.status || 'PENDING', 
          referenceId,
          data: statusData 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Handle payment initiation (default endpoint)
    if (req.method === 'POST') {
      // Get the current user for authenticated requests
      let user = null;
      if (authHeader) {
        const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
        if (!authError && authUser) {
          user = authUser;
        }
      }

      const { amount, phone, transactionId }: MoMoPaymentRequest = await req.json();

      // Validate input
      if (!amount || !phone) {
        return new Response(
          JSON.stringify({ success: false, error: 'Amount and phone number are required' }),
          { 
            status: 400,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      if (amount <= 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid amount. Amount must be greater than 0.' }),
          { 
            status: 400,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      console.log(`Processing payment request: amount=${amount}, phone=${phone}, user=${user?.id}`);

      // Initiate payment
      const paymentResult = await initiatePayment(phone, amount);
      
      if (!paymentResult.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: paymentResult.error 
          }),
          { 
            status: 400,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      // Create transaction record
      const transactionData = {
        reference_id: paymentResult.referenceId!,
        external_id: MOMO_CONFIG.externalId,
        amount: amount,
        currency: MOMO_CONFIG.currency,
        phone: phone,
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

      return new Response(
        JSON.stringify({
          success: true,
          referenceId: paymentResult.referenceId,
          externalId: MOMO_CONFIG.externalId,
          message: 'Payment initiated successfully',
          amount: amount,
          currency: MOMO_CONFIG.currency
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error: any) {
    console.error('MoMo API error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        details: error.stack || 'No additional details'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
