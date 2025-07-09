import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== MoMo Webhook Started ===');
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = await req.json();
    console.log('Webhook payload:', JSON.stringify(webhookData, null, 2));

    // Extract key fields from MTN callback
    const {
      referenceId,
      status,
      reason,
      financialTransactionId,
      externalId
    } = webhookData;

    if (!referenceId) {
      console.error('Missing referenceId in webhook');
      return new Response(
        JSON.stringify({ error: 'Missing referenceId' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update momo_transactions table
    const { data: momoTransaction, error: updateError } = await supabaseClient
      .from('momo_transactions')
      .update({
        status: status || 'UNKNOWN',
        reason: reason,
        financial_transaction_id: financialTransactionId,
        callback_received_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('reference_id', referenceId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating momo transaction:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update transaction' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Updated momo transaction:', momoTransaction);

    // If payment successful, create record in transactions table
    if (status === 'SUCCESSFUL' && momoTransaction) {
      const { error: transactionError } = await supabaseClient
        .from('transactions')
        .insert({
          user_id: momoTransaction.user_id,
          type: 'deposit',
          amount: momoTransaction.amount,
          currency: momoTransaction.currency,
          description: 'MoMo top-up confirmed',
          payment_method: 'momo',
          phone: momoTransaction.phone,
          reference_id: referenceId,
          external_id: externalId || momoTransaction.external_id,
          status: 'completed'
        });

      if (transactionError) {
        console.error('Error creating transaction record:', transactionError);
        // Don't fail the webhook, just log the error
      } else {
        console.log('✅ Transaction record created successfully');
      }
    }

    console.log(`✅ Webhook processed successfully for reference: ${referenceId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        referenceId,
        status
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});