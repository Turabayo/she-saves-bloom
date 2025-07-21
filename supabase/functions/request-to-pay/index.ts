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

    // Use EUR for sandbox, RWF for production
    const isProduction = Deno.env.get('ENVIRONMENT') === 'production'
    const currency = isProduction ? 'RWF' : 'EUR'
    
    const payload = {
      amount: amount.toString(),
      currency: currency,
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

      console.log('=== MoMo Response Status ===', momoRes.status);
      console.log('=== MoMo Response Headers ===', Object.fromEntries(momoRes.headers.entries()));
      
      // Get response body for logging
      const responseText = await momoRes.text()
      console.log('=== MoMo Response Body ===', responseText);

      if (!momoRes.ok) {
        console.error('MTN MoMo error response:', responseText)
        
        // Try to parse as JSON for better error details
        let errorDetails = responseText
        try {
          const errorJson = JSON.parse(responseText)
          errorDetails = errorJson
          console.error('Parsed error:', errorJson)
        } catch (e) {
          console.error('Error response is not JSON')
        }
        
        return new Response(JSON.stringify({ 
          error: 'momo_failed', 
          details: errorDetails,
          status: momoRes.status,
          currency_used: currency
        }), {
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
            currency: currency,
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