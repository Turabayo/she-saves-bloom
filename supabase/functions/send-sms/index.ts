
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
    console.log('=== SMS FUNCTION CALLED ===');
    
    const { phoneNumber, message }: SmsRequest = await req.json();
    
    console.log('SMS Request received:', { phoneNumber, messageLength: message?.length });

    if (!phoneNumber || !message) {
      console.error('Missing required fields:', { hasPhone: !!phoneNumber, hasMessage: !!message });
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

    console.log('Africa\'s Talking config:', {
      hasApiKey: !!apiKey,
      hasUsername: !!username,
      apiKeyLength: apiKey?.length,
      username: username
    });

    if (!apiKey || !username) {
      console.error('Missing Africa\'s Talking credentials');
      return new Response(
        JSON.stringify({ error: 'SMS service not configured - missing credentials' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Ensure phone number is in correct format for Africa's Talking
    let formattedPhone = phoneNumber;
    
    // Remove any spaces or special characters
    formattedPhone = formattedPhone.replace(/[\s\-\(\)]/g, '');
    
    // Add + if not present
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('25')) {
        formattedPhone = '+' + formattedPhone;
      } else if (formattedPhone.startsWith('07') || formattedPhone.startsWith('08')) {
        formattedPhone = '+25' + formattedPhone;
      } else if (formattedPhone.startsWith('0')) {
        formattedPhone = '+250' + formattedPhone.substring(1);
      } else {
        formattedPhone = '+250' + formattedPhone;
      }
    }
    
    console.log('Phone number formatting:');
    console.log('  Original:', phoneNumber);
    console.log('  Formatted:', formattedPhone);

    const requestBody = new URLSearchParams({
      username: username,
      to: formattedPhone,
      message: message,
    });

    console.log('SMS Request details:');
    console.log('  Username:', username);
    console.log('  To:', formattedPhone);
    console.log('  Message preview:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: requestBody,
    });

    console.log('=== AFRICA\'S TALKING API RESPONSE ===');
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Raw response body:', responseText);
    
    if (!responseText) {
      throw new Error('Empty response from Africa\'s Talking API');
    }
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Parsed Africa\'s Talking Response:', JSON.stringify(responseData, null, 2));
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      console.error('Response text was:', responseText);
      throw new Error(`Invalid JSON response from SMS service. Status: ${response.status}, Body: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      console.error('=== AFRICA\'S TALKING API ERROR ===');
      console.error('Status:', response.status);
      console.error('Status text:', response.statusText);
      console.error('Error response:', responseData);
      
      const errorMessage = responseData?.SMSMessageData?.Message || 
                          responseData?.message || 
                          `HTTP ${response.status}: ${response.statusText}`;
      
      throw new Error(`Africa's Talking API error: ${errorMessage}`);
    }

    // Check if the SMS was sent successfully
    const smsData = responseData?.SMSMessageData;
    const recipients = smsData?.Recipients || [];
    
    console.log('SMS send result:');
    console.log('  Message:', smsData?.Message);
    console.log('  Recipients:', recipients);
    
    // Check for successful sends
    const successfulSends = recipients.filter((r: any) => 
      r.status === 'Success' || r.statusCode === 101
    );
    
    const failedSends = recipients.filter((r: any) => 
      r.status !== 'Success' && r.statusCode !== 101
    );
    
    if (failedSends.length > 0) {
      console.warn('Some SMS sends failed:', failedSends);
    }
    
    if (successfulSends.length === 0 && recipients.length > 0) {
      console.error('All SMS sends failed:', recipients);
      throw new Error(`SMS delivery failed: ${recipients[0]?.status || 'Unknown error'}`);
    }

    console.log('✅ SMS sent successfully');

    return new Response(JSON.stringify({
      success: true,
      data: responseData,
      message: 'SMS sent successfully',
      recipients_count: recipients.length,
      successful_sends: successfulSends.length,
      failed_sends: failedSends.length
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("=== SMS FUNCTION ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send SMS',
        error_type: error.constructor.name
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
