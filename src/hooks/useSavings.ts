import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Saving {
  id: string;
  user_id: string;
  goal_id: string;
  amount: number;
  source: string;
  type: string;
  status: string;
  created_at: string;
}

export const useSavings = () => {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSavings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('savings')
        .select(`
          *,
          savings_goals (
            name,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavings(data || []);
    } catch (error) {
      console.error('Error fetching savings:', error);
      setSavings([]);
    } finally {
      setLoading(false);
    }
  };

  const addSaving = async (savingData: {
    goal_id: string;
    amount: number;
    source?: string;
    type?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('savings')
      .insert([
        {
          user_id: user.id,
          source: 'momo',
          type: 'topup',
          status: 'success',
          ...savingData
        }
      ])
      .select()
      .single();

    if (error) throw error;

    await fetchSavings(); // Refresh the list
    return data;
  };

  const getTotalSavings = () => {
    return savings
      .filter(saving => saving.status === 'success')
      .reduce((total, saving) => total + saving.amount, 0);
  };

  const getSavingsForGoal = (goalId: string) => {
    return savings
      .filter(saving => saving.goal_id === goalId && saving.status === 'success')
      .reduce((total, saving) => total + saving.amount, 0);
  };

  useEffect(() => {
    fetchSavings();
  }, [user]);

  return {
    savings,
    loading,
    addSaving,
    getTotalSavings,
    getSavingsForGoal,
    refetch: fetchSavings
  };
};