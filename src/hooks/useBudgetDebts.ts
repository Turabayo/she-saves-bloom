import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BudgetDebt {
  id: string;
  user_id: string;
  budget_period_id: string;
  name: string;
  planned_amount: number;
  actual_amount: number;
  created_at: string;
  updated_at: string;
}

export const useBudgetDebts = (budgetPeriodId: string | null) => {
  const [debts, setDebts] = useState<BudgetDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDebts = async () => {
    if (!user || !budgetPeriodId) {
      setDebts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budget_debts')
        .select('*')
        .eq('user_id', user.id)
        .eq('budget_period_id', budgetPeriodId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setDebts((data || []) as BudgetDebt[]);
    } catch (error) {
      console.error('Error fetching debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDebt = async (name: string, planned_amount: number) => {
    if (!user || !budgetPeriodId) return;

    try {
      const { data, error } = await supabase
        .from('budget_debts')
        .insert([{
          user_id: user.id,
          budget_period_id: budgetPeriodId,
          name,
          planned_amount,
          actual_amount: 0
        }])
        .select()
        .single();

      if (error) throw error;
      setDebts(prev => [...prev, data as BudgetDebt]);
      return data;
    } catch (error) {
      console.error('Error adding debt:', error);
      toast({
        title: "Error",
        description: "Failed to add debt",
        variant: "destructive",
      });
    }
  };

  const updateDebt = async (id: string, updates: Partial<Pick<BudgetDebt, 'name' | 'planned_amount' | 'actual_amount'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budget_debts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setDebts(prev => prev.map(debt => debt.id === id ? data as BudgetDebt : debt));
      return data;
    } catch (error) {
      console.error('Error updating debt:', error);
      toast({
        title: "Error",
        description: "Failed to update debt",
        variant: "destructive",
      });
    }
  };

  const deleteDebt = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budget_debts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setDebts(prev => prev.filter(debt => debt.id !== id));
    } catch (error) {
      console.error('Error deleting debt:', error);
      toast({
        title: "Error",
        description: "Failed to delete debt",
        variant: "destructive",
      });
    }
  };

  const getTotalPlanned = () => debts.reduce((sum, d) => sum + d.planned_amount, 0);
  const getTotalActual = () => debts.reduce((sum, d) => sum + d.actual_amount, 0);
  const getOverallProgress = () => {
    const planned = getTotalPlanned();
    return planned > 0 ? (getTotalActual() / planned) * 100 : 0;
  };

  useEffect(() => {
    fetchDebts();
  }, [user, budgetPeriodId]);

  return {
    debts,
    loading,
    addDebt,
    updateDebt,
    deleteDebt,
    getTotalPlanned,
    getTotalActual,
    getOverallProgress,
    refetch: fetchDebts,
  };
};
