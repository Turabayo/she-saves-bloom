import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  category: string;
  goal_amount: number;
  created_at: string;
  updated_at: string;
  current_amount?: number; // Calculated from savings
  progress?: number; // Calculated percentage
}

export const useSavingsGoals = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      if (!goalsData) {
        setGoals([]);
        return;
      }

      // Calculate current amounts for each goal
      const goalsWithProgress = await Promise.all(
        goalsData.map(async (goal) => {
          const { data: savingsData } = await supabase
            .from('savings')
            .select('amount')
            .eq('goal_id', goal.id)
            .eq('status', 'success');

          const currentAmount = savingsData?.reduce((sum, saving) => sum + saving.amount, 0) || 0;
          const progress = goal.goal_amount > 0 ? Math.round((currentAmount / goal.goal_amount) * 100) : 0;

          return {
            ...goal,
            current_amount: currentAmount,
            progress: Math.min(progress, 100) // Cap at 100%
          };
        })
      );

      setGoals(goalsWithProgress);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: {
    name: string;
    category: string;
    goal_amount: number;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('savings_goals')
      .insert([
        {
          user_id: user.id,
          ...goalData
        }
      ])
      .select()
      .single();

    if (error) throw error;

    await fetchGoals(); // Refresh the list
    return data;
  };

  const updateGoal = async (goalId: string, updates: Partial<SavingsGoal>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    await fetchGoals(); // Refresh the list
    return data;
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) throw error;

    await fetchGoals(); // Refresh the list
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals
  };
};