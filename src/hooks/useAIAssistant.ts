
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your SheSaves AI assistant. I\'m here to help you build your savings and achieve your financial goals. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessage = async (message: string) => {
    if (!user || !message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Get conversation history (last 8 messages)
      const conversationHistory = messages.slice(-8).map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: message.trim(),
          conversationHistory,
          userContext: {
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        console.error('AI Assistant error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI request failed');
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Add graceful fallback message
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "AI temporarily unavailable — try again soon. In the meantime, remember that consistent small savings can make a big difference in building your financial security!",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackMessage]);

      // Only show toast for unexpected errors, not connection issues
      if (!error.message?.includes('FunctionsHttpError')) {
        toast({
          title: "Connection Issue",
          description: "I'm having trouble connecting. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Hello! I\'m your SheSaves AI assistant. I\'m here to help you build your savings and achieve your financial goals. How can I assist you today?',
        timestamp: new Date()
      }
    ]);
  };

  return {
    messages,
    loading,
    sendMessage,
    clearConversation
  };
};
