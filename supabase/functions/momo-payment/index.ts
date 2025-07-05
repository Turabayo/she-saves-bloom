
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// MTN MoMo Configuration
const MOMO_CONFIG = {
  baseUrl: 'https://sandbox.momodeveloper.mtn.com',
  subscriptionKey: '3ebcbab70b4b4ad6b13a23312f5b70e3',
  targetEnvironment: 'sandbox',
  currency: 'EUR', // EUR for sandbox, RWF for production
  authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSMjU2In0.eyJjbGllbnRJZCI6Ijc4MGMxNzdiLWZkY2YtNGM5Zi04YTUxLTQ5OWVlMzk1NTc0ZiIsImV4cGlyZXMiOiIyMDI1LTA3LTA1VDE2OjU3OjM4LjMwNCIsInNlc3Npb25JZCI6Ijc2ODk4OWVkLTgzZmEtNGUwMC1hOTkwLTVkMzRjYmEzMDkwNCJ9.aolYOkszNsGdgNWh0xvBbPBqXqdP0xQXZ2lHH_4lTuPPWwwuymd5wjgMcHP8KN3l6fw_kUYA4s0mhBoSbaJ4wuw-jaj1FQDv62WVhoGDDsuELjQdLLulVtIwdGOcjS81hDkh7Hk4xVYEdL2zv7HmkGvoQ0S46gsWTWkB11K9nF2LDCB9rX46iSAkXz_VNAj-9BOKqlB7MBjxpeoiRrvv3OACfKzw248bWQlm5lVQtWM8-XH4mKRNU6fKedv130GhMQIDw-hdx6aBeSrt3Bn273_nwxK07zL6LU05F76y1GR-M6Fy3VVbpXHwaULg0kTcqvuJP1N8exupqpqAUQfDjQ'
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
  status: 'SUCCESSFUL' | 'FAILED' | 'REJECTED' | 'TIMEOUT';
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

// Format phone number for MTN API
function formatPhoneNumber(phone: string): string {
  let formattedPhone = phone.replace(/^\+?/, '');
  if (formattedPhone.startsWith('078') || formattedPhone.startsWith('072') || 
      formattedPhone.startsWith('073') || formattedPhone.startsWith('079')) {
    formattedPhone = '25' + formattedPhone;
  }
  return formattedPhone;
}

// Initialize payment with MTN MoMo
async function initiatePayment(phone: string, amount: number): Promise<string> {
  const referenceId = generateUUID();
  const formattedPhone = formatPhoneNumber(phone);

  console.log(`Initiating payment: ${amount} ${MOMO_CONFIG.currency} to ${formattedPhone}`);

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
      body: JSON.stringify({
        amount: amount.toString(),
        currency: MOMO_CONFIG.currency,
        externalId: referenceId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: formattedPhone
        },
        payerMessage: 'SheSaves deposit',
        payeeNote: 'Savings deposit payment'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MTN MoMo API error:', errorText);
      throw new Error(`Payment initiation failed: ${response.status} ${errorText}`);
    }

    console.log(`Payment initiated successfully with reference ID: ${referenceId}`);
    return referenceId;

  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
}

// Check payment status
async function checkPaymentStatus(referenceId: string): Promise<string> {
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
    
    return statusData.status || 'PENDING';

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
        throw new Error('Reference ID is required');
      }

      const status = await checkPaymentStatus(referenceId);
      
      // Update local database with status
      const { error } = await supabaseClient
        .from('momo_transactions')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('reference_id', referenceId);

      if (error) {
        console.error('Error updating transaction status:', error);
      }

      return new Response(
        JSON.stringify({ success: true, status, referenceId }),
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
        throw new Error('Amount and phone number are required');
      }

      if (amount <= 0) {
        throw new Error('Invalid amount');
      }

      // Validate phone number format (Rwanda format)
      const phoneRegex = /^(\+?25)?(078|072|073|079)\d{7}$/;
      if (!phoneRegex.test(phone)) {
        throw new Error('Invalid phone number format');
      }

      // Initiate payment
      const referenceId = await initiatePayment(phone, amount);

      // Create or update transaction record
      const transactionData = {
        reference_id: referenceId,
        external_id: referenceId,
        amount: amount,
        currency: MOMO_CONFIG.currency,
        phone: formatPhoneNumber(phone),
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
              external_id: referenceId,
              reference_id: referenceId,
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
          referenceId: referenceId,
          externalId: referenceId,
          message: 'Payment initiated successfully'
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
        error: error.message || 'Internal server error'
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
});
