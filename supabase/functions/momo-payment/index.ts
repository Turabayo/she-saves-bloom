
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MoMoPaymentRequest {
  amount: number;
  phone: string;
  transactionId: string;
}

interface MoMoApiResponse {
  success: boolean;
  externalId?: string;
  referenceId?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { amount, phone, transactionId }: MoMoPaymentRequest = await req.json()

    // Validate input
    if (!amount || !phone || !transactionId) {
      throw new Error('Missing required fields')
    }

    if (amount <= 0) {
      throw new Error('Invalid amount')
    }

    // Format phone number for MTN API (ensure it starts with 25078, 25072, etc.)
    let formattedPhone = phone.replace(/^\+?/, ''); // Remove + if present
    if (formattedPhone.startsWith('078') || formattedPhone.startsWith('072') || 
        formattedPhone.startsWith('073') || formattedPhone.startsWith('079')) {
      formattedPhone = '25' + formattedPhone;
    }

    // Generate unique external ID
    const externalId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // MTN MoMo API credentials (these should be stored as Supabase secrets)
    const momoApiUser = Deno.env.get('MTN_MOMO_API_USER');
    const momoApiKey = Deno.env.get('MTN_MOMO_API_KEY');
    const momoSubscriptionKey = Deno.env.get('MTN_MOMO_SUBSCRIPTION_KEY');
    const momoEnvironment = Deno.env.get('MTN_MOMO_ENVIRONMENT') || 'sandbox';

    if (!momoApiUser || !momoApiKey || !momoSubscriptionKey) {
      throw new Error('MTN MoMo API credentials not configured');
    }

    // Get access token first
    const tokenResponse = await fetch(`https://sandbox.momodeveloper.mtn.com/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${momoApiUser}:${momoApiKey}`)}`,
        'Ocp-Apim-Subscription-Key': momoSubscriptionKey,
        'Content-Type': 'application/json'
      }
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get MTN MoMo access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Make payment request
    const paymentResponse = await fetch(`https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Reference-Id': externalId,
        'X-Target-Environment': momoEnvironment,
        'Ocp-Apim-Subscription-Key': momoSubscriptionKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency: 'RWF',
        externalId: externalId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: formattedPhone
        },
        payerMessage: 'SheSaves deposit',
        payeeNote: `Savings deposit for user ${user.id}`
      })
    });

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.text();
      console.error('MTN MoMo API error:', errorData);
      throw new Error('Payment request failed');
    }

    // Update transaction status in database
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({
        external_id: externalId,
        reference_id: externalId,
        status: 'processing'
      })
      .eq('id', transactionId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database update error:', updateError);
    }

    const response: MoMoApiResponse = {
      success: true,
      externalId: externalId,
      referenceId: externalId
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('MoMo payment error:', error);
    
    const errorResponse: MoMoApiResponse = {
      success: false,
      error: error.message
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
