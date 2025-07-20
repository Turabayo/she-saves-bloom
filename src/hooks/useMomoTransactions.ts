import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MomoTransaction {
  id: string;
  amount: number;
  currency: string;
  phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MomoTransactionUpdate {
  new: MomoTransaction;
  old: MomoTransaction;
}

export const useMomoTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<MomoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const subscribersRef = useRef<((update: MomoTransactionUpdate) => void)[]>([]);

  // Subscribe to updates
  const subscribe = (callback: (update: MomoTransactionUpdate) => void) => {
    subscribersRef.current.push(callback);
    
    // Return unsubscribe function
    return () => {
      subscribersRef.current = subscribersRef.current.filter(cb => cb !== callback);
    };
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('momo_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching momo transactions:', error);
        } else {
          setTransactions(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    // Clean up any existing channel first
    if (channelRef.current) {
      console.log('Cleaning up existing momo transactions channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Set up realtime subscription for transaction updates
    const channelName = `momo-transactions-${user.id}-${Date.now()}`;
    console.log('Creating momo transactions channel:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'momo_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('MoMo transaction updated:', payload.new);
          
          // Update local state
          setTransactions(prev => 
            prev.map(t => 
              t.id === payload.new.id 
                ? { ...t, ...payload.new }
                : t
            )
          );

          // Notify all subscribers
          subscribersRef.current.forEach(callback => {
            callback({
              new: payload.new as MomoTransaction,
              old: payload.old as MomoTransaction
            });
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up momo transactions channel:', channelName);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      // Clear all subscribers
      subscribersRef.current = [];
    };
  }, [user]);

  return {
    transactions,
    loading,
    subscribe
  };
};