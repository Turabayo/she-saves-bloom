import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BudgetPeriod {
  id: string;
  user_id: string;
  month: number;
  year: number;
  currency: string;
  planned_income: number;
  created_at: string;
  updated_at: string;
}

export const useBudgetPeriod = () => {
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const fetchOrCreateBudgetPeriod = async (month: number = currentMonth, year: number = currentYear) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Try to fetch existing budget period
      const { data: existing, error: fetchError } = await supabase
        .from('budget_periods')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        setBudgetPeriod(existing as BudgetPeriod);
        return existing;
      }

      // Create new budget period
      const { data: newPeriod, error: createError } = await supabase
        .from('budget_periods')
        .insert([{
          user_id: user.id,
          month,
          year,
          currency: 'RWF',
          planned_income: 0
        }])
        .select()
        .single();

      if (createError) throw createError;

      setBudgetPeriod(newPeriod as BudgetPeriod);
      return newPeriod;
    } catch (error) {
      console.error('Error with budget period:', error);
      toast({
        title: "Error",
        description: "Failed to load budget period",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePlannedIncome = async (amount: number) => {
    if (!user || !budgetPeriod) return;

    try {
      const { data, error } = await supabase
        .from('budget_periods')
        .update({ planned_income: amount })
        .eq('id', budgetPeriod.id)
        .select()
        .single();

      if (error) throw error;
      setBudgetPeriod(data as BudgetPeriod);
      return data;
    } catch (error) {
      console.error('Error updating planned income:', error);
      toast({
        title: "Error",
        description: "Failed to update planned income",
        variant: "destructive",
      });
    }
  };

  const updateCurrency = async (currency: string) => {
    if (!user || !budgetPeriod) return;

    try {
      const { data, error } = await supabase
        .from('budget_periods')
        .update({ currency })
        .eq('id', budgetPeriod.id)
        .select()
        .single();

      if (error) throw error;
      setBudgetPeriod(data as BudgetPeriod);
      return data;
    } catch (error) {
      console.error('Error updating currency:', error);
      toast({
        title: "Error",
        description: "Failed to update currency",
        variant: "destructive",
      });
    }
  };

  const switchPeriod = async (month: number, year: number) => {
    await fetchOrCreateBudgetPeriod(month, year);
  };

  useEffect(() => {
    fetchOrCreateBudgetPeriod();
  }, [user]);

  return {
    budgetPeriod,
    loading,
    updatePlannedIncome,
    updateCurrency,
    switchPeriod,
    refetch: fetchOrCreateBudgetPeriod,
  };
};
