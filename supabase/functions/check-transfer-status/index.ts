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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Check transfer status request received');
    
    const body = await req.json()
    const { momo_reference_id } = body

    console.log('Checking status for reference ID:', momo_reference_id);

    if (!momo_reference_id) {
      console.error('Missing momo_reference_id');
      return new Response('Missing momo_reference_id', { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    const accessToken = Deno.env.get('DISB_ACCESS_TOKEN')
    const subscriptionKey = Deno.env.get('DISB_SUBSCRIPTION_KEY')
    const momoUrl = `https://sandbox.momodeveloper.mtn.com/disbursement/v1_0/transfer/${momo_reference_id}`

    console.log('MTN MoMo status URL:', momoUrl);

    const response = await fetch(momoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Target-Environment': 'sandbox',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json'
      }
    })

    console.log('MoMo status response status:', response.status);

    if (!response.ok) {
      console.error('Failed to fetch from MoMo API:', response.status);
      return new Response(JSON.stringify({ error: 'Failed to check status' }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    const result = await response.json()
    console.log('MoMo status result:', result);
    
    const status = result.status || 'UNKNOWN'

    // Update withdrawal record
    const { data: updatedWithdrawal, error: updateError } = await supabase
      .from('withdrawals')
      .update({
        status,
        momo_transaction_id: result.financialTransactionId || null,
        updated_at: new Date().toISOString()
      })
      .eq('momo_reference_id', momo_reference_id)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update withdrawal status' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    console.log('Withdrawal status updated:', updatedWithdrawal);

    return new Response(JSON.stringify({ 
      status, 
      result,
      withdrawal: updatedWithdrawal
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })

  } catch (err) {
    console.error('Check Status Error:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
})