
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { message, conversationHistory = [], userContext = {} }: AssistantRequest = await req.json();

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

    // Prepare system prompt with financial context
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

Always maintain a warm, professional tone and provide specific, actionable advice. If asked about non-financial topics, gently redirect to financial matters while being helpful.`;

    // Build conversation messages
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with context for user:', user.id);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    // Log the conversation for analytics (optional)
    await supabaseClient
      .from('ai_conversations')
      .insert([
        {
          user_id: user.id,
          user_message: message,
          assistant_response: assistantResponse,
          context: userContext,
          created_at: new Date().toISOString()
        }
      ])
      .catch(() => {}); // Ignore if table doesn't exist

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
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        fallbackResponse: "I'm sorry, I'm having trouble connecting right now. Please try asking your question again in a moment. In the meantime, remember that consistent small savings can make a big difference in building your financial security!"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
