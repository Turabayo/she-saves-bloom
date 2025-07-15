
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AssistantRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  userContext?: {
    totalSavings?: number;
    monthlyTransactions?: number;
    savingsGoals?: any[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== AI Assistant Request Started ===');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { message, conversationHistory = [], userContext = {} }: AssistantRequest = await req.json();

    console.log('Processing AI request for user:', user.id);

    // Get user's financial data for context
    const { data: investments } = await supabaseClient
      .from('investments')
      .select('*')
      .eq('user_id', user.id);

    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const totalSavings = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    const recentTransactions = transactions?.length || 0;

    const systemPrompt = `You are SheSaves AI, a friendly and knowledgeable financial advisor specifically designed to help women build their savings and achieve financial independence. You provide personalized advice based on their financial data.

Current User Context:
- Total Savings: ${totalSavings} RWF
- Recent Transactions: ${recentTransactions}
- Investment Goals: ${investments?.length || 0}

Your responses should be:
1. Encouraging and supportive
2. Focused on practical savings strategies  
3. Tailored to women's financial empowerment
4. Clear and actionable
5. Based on their actual financial data when relevant

Always maintain a warm, professional tone and provide specific, actionable advice. Keep responses concise and helpful. If asked about non-financial topics, gently redirect to financial matters while being helpful.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8), // Keep last 8 messages for context
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenRouter with DeepSeek');

    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://shesaves.app',
        'X-Title': 'SheSaves AI Assistant',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: messages,
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    console.log('OpenRouter response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        response: assistantResponse,
        context: {
          totalSavings,
          recentTransactions
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('AI Assistant error:', error);
    
    // Return fallback response with proper structure
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        fallbackMessage: "Sorry! Assistant is offline. Try again shortly."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
