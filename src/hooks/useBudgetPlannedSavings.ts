import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BudgetPlannedSaving {
  id: string;
  user_id: string;
  budget_period_id: string;
  goal_id: string | null;
  name: string;
  planned_amount: number;
  created_at: string;
  updated_at: string;
}

export const useBudgetPlannedSavings = (budgetPeriodId: string | null) => {
  const [plannedSavings, setPlannedSavings] = useState<BudgetPlannedSaving[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPlannedSavings = async () => {
    if (!user || !budgetPeriodId) {
      setPlannedSavings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budget_planned_savings')
        .select('*')
        .eq('user_id', user.id)
        .eq('budget_period_id', budgetPeriodId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPlannedSavings((data || []) as BudgetPlannedSaving[]);
    } catch (error) {
      console.error('Error fetching planned savings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPlannedSaving = async (name: string, planned_amount: number, goal_id?: string) => {
    if (!user || !budgetPeriodId) return;

    try {
      const { data, error } = await supabase
        .from('budget_planned_savings')
        .insert([{
          user_id: user.id,
          budget_period_id: budgetPeriodId,
          name,
          planned_amount,
          goal_id: goal_id || null
        }])
        .select()
        .single();

      if (error) throw error;
      setPlannedSavings(prev => [...prev, data as BudgetPlannedSaving]);
      return data;
    } catch (error) {
      console.error('Error adding planned saving:', error);
      toast({
        title: "Error",
        description: "Failed to add savings allocation",
        variant: "destructive",
      });
    }
  };

  const updatePlannedSaving = async (id: string, updates: Partial<Pick<BudgetPlannedSaving, 'name' | 'planned_amount' | 'goal_id'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budget_planned_savings')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setPlannedSavings(prev => prev.map(s => s.id === id ? data as BudgetPlannedSaving : s));
      return data;
    } catch (error) {
      console.error('Error updating planned saving:', error);
      toast({
        title: "Error",
        description: "Failed to update savings allocation",
        variant: "destructive",
      });
    }
  };

  const deletePlannedSaving = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budget_planned_savings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setPlannedSavings(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting planned saving:', error);
      toast({
        title: "Error",
        description: "Failed to delete savings allocation",
        variant: "destructive",
      });
    }
  };

  const getTotalPlanned = () => plannedSavings.reduce((sum, s) => sum + s.planned_amount, 0);

  useEffect(() => {
    fetchPlannedSavings();
  }, [user, budgetPeriodId]);

  return {
    plannedSavings,
    loading,
    addPlannedSaving,
    updatePlannedSaving,
    deletePlannedSaving,
    getTotalPlanned,
    refetch: fetchPlannedSavings,
  };
};
