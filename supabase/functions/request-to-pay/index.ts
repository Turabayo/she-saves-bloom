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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== REQUEST TO PAY FUNCTION START ===');
    
    const { user_id, amount, phone_number } = await req.json()
    
    console.log('Request data:', { user_id, amount, phone_number });
    
    // Basic validation
    if (!user_id || !amount || !phone_number) {
      console.error('Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const COLL_API_USER = Deno.env.get('COLL_API_USER')
    const COLL_API_KEY = Deno.env.get('COLL_API_KEY')
    const COLL_SUBSCRIPTION_KEY = Deno.env.get('COLL_SUBSCRIPTION_KEY')

    console.log('Environment check:', {
      hasUser: !!COLL_API_USER,
      hasKey: !!COLL_API_KEY,
      hasSub: !!COLL_SUBSCRIPTION_KEY
    });

    if (!COLL_API_USER || !COLL_API_KEY || !COLL_SUBSCRIPTION_KEY) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const basicToken = btoa(`${COLL_API_USER}:${COLL_API_KEY}`)
    const collectionTokenUUID = '45c1fec9-dae8-4a9f-a00a-c5d282cb0259'

    console.log('Getting access token...');

    let accessToken = ''
    try {
      const tokenRes = await fetch('https://sandbox.momodeveloper.mtn.com/collection/token/', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicToken}`,
          'Ocp-Apim-Subscription-Key': COLL_SUBSCRIPTION_KEY,
          'X-Reference-Id': collectionTokenUUID,
        },
      })

      console.log('Token response status:', tokenRes.status);

      const tokenData = await tokenRes.json()
      console.log('Token response data:', tokenData);
      
      accessToken = tokenData.access_token

      if (!accessToken) {
        console.error('Failed to get token:', tokenData)
        return new Response(JSON.stringify({ error: 'login_failed', details: tokenData }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } catch (err) {
      console.error('Token fetch error:', err)
      return new Response(JSON.stringify({ error: 'token_fetch_failed', details: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const referenceId = crypto.randomUUID()
    console.log('Generated reference ID:', referenceId);

    const payload = {
      amount: amount.toString(),
      currency: 'RWF',
      externalId: referenceId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phone_number,
      },
      payerMessage: 'SheSaves top-up',
      payeeNote: 'Keep going toward your goal!',
    }

    console.log('Making MoMo request with payload:', payload);

    try {
      const momoRes = await fetch(`https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': 'sandbox',
          'Ocp-Apim-Subscription-Key': COLL_SUBSCRIPTION_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('MoMo response status:', momoRes.status);

      if (!momoRes.ok) {
        const errorBody = await momoRes.text()
        console.error('MTN MoMo error response:', errorBody)
        return new Response(JSON.stringify({ error: 'momo_failed', details: errorBody }), {
          status: momoRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('✅ MoMo payment request successful, reference:', referenceId);
      
      // Store the MoMo transaction in our database
      try {
        const { error: insertError } = await supabase
          .from('momo_transactions')
          .insert({
            user_id,
            amount,
            currency: 'RWF',
            phone: phone_number,
            reference_id: referenceId,
            external_id: referenceId,
            status: 'PENDING'
          });

        if (insertError) {
          console.error('Database insert error:', insertError);
          // Don't fail the API call, just log the error
        } else {
          console.log('✅ Transaction stored in database');
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Don't fail the API call for database errors
      }

      return new Response(JSON.stringify({ success: true, referenceId }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } catch (err) {
      console.error('MoMo API error:', err)
      return new Response(JSON.stringify({ error: 'network_failed', details: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  } catch (err) {
    console.error('Request parsing error:', err)
    return new Response(JSON.stringify({ error: 'Invalid request', details: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})