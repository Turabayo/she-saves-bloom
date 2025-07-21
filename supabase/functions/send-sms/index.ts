import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmsRequest {
  phoneNumber: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message }: SmsRequest = await req.json();
    
    console.log('SMS Request:', { phoneNumber, message });

    if (!phoneNumber || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone number and message are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const apiKey = Deno.env.get("AT_API_KEY");
    const username = Deno.env.get("AT_USERNAME");

    if (!apiKey || !username) {
      console.error('Missing Africa\'s Talking credentials');
      return new Response(
        JSON.stringify({ error: 'SMS service not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Ensure phone number is in correct format for Africa's Talking
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    console.log('Sending SMS to:', formattedPhone);

    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: username,
        to: formattedPhone,
        message: message,
      }),
    });

    const responseData = await response.json();
    console.log('Africa\'s Talking Response:', responseData);

    if (!response.ok) {
      throw new Error(`Africa's Talking API error: ${responseData.SMSMessageData?.Message || 'Unknown error'}`);
    }

    return new Response(JSON.stringify({
      success: true,
      data: responseData,
      message: 'SMS sent successfully'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-sms function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send SMS'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);