import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

async function getAccessToken() {
  const apiKey = Deno.env.get('COLL_API_KEY')!
  const subscriptionKey = Deno.env.get('COLL_SUBSCRIPTION_KEY')!

  const res = await fetch('https://sandbox.momodeveloper.mtn.com/collection/token/', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${apiKey}`,
      'Ocp-Apim-Subscription-Key': subscriptionKey
    }
  })

  const data = await res.json()
  return data.access_token
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { momo_reference_id } = await req.json()
    
    console.log('Checking top-up status for reference:', momo_reference_id);

    if (!momo_reference_id) {
      return new Response(
        JSON.stringify({ error: 'Missing momo_reference_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const accessToken = await getAccessToken()
    const subscriptionKey = Deno.env.get('COLL_SUBSCRIPTION_KEY')!

    const momoUrl = `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/${momo_reference_id}`

    console.log('Querying MTN MoMo URL:', momoUrl);

    const res = await fetch(momoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Target-Environment': 'sandbox',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json'
      }
    })

    const result = await res.json()
    const status = result.status || 'UNKNOWN'

    console.log('MTN MoMo status response:', { status, result });

    // Update the topups table with the latest status
    const { error: updateError } = await supabase.from('topups').update({
      status,
      momo_transaction_id: result.financialTransactionId || null,
      updated_at: new Date().toISOString()
    }).eq('momo_reference_id', momo_reference_id)

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update top-up status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Top-up status updated successfully');

    return new Response(
      JSON.stringify({ 
        status, 
        result,
        success: status === 'SUCCESSFUL'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Top-up Status Error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})