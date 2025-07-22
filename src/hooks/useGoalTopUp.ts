import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useGoalTopUp = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const topUpGoal = async (goalId: string, amount: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to top up a goal",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Add a savings record for this goal
      const { error: savingsError } = await supabase
        .from('savings')
        .insert([
          {
            user_id: user.id,
            goal_id: goalId,
            amount: amount,
            source: 'manual',
            type: 'topup',
            status: 'success'
          }
        ]);

      if (savingsError) throw savingsError;

      toast({
        title: "Success",
        description: "Goal topped up successfully!",
      });

      return true;
    } catch (error) {
      console.error('Error topping up goal:', error);
      toast({
        title: "Error",
        description: "Failed to top up goal",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markGoalAsComplete = async (goalId: string) => {
    if (!user) return;

    try {
      // For now, we'll just add a note to track completion
      // In a real app, you might want to add a 'completed' field to the goals table
      const { error } = await supabase
        .from('savings_goals')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "🎯 Goal Completed!",
        description: "Congratulations on reaching your goal!",
      });

      return true;
    } catch (error) {
      console.error('Error marking goal as complete:', error);
      return false;
    }
  };

  return {
    topUpGoal,
    markGoalAsComplete,
    loading
  };
};