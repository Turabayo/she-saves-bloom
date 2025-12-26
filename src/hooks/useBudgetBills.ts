import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BudgetBill {
  id: string;
  user_id: string;
  budget_period_id: string;
  name: string;
  planned_amount: number;
  actual_amount: number;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

export const useBudgetBills = (budgetPeriodId: string | null) => {
  const [bills, setBills] = useState<BudgetBill[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBills = async () => {
    if (!user || !budgetPeriodId) {
      setBills([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budget_bills')
        .select('*')
        .eq('user_id', user.id)
        .eq('budget_period_id', budgetPeriodId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBills((data || []) as BudgetBill[]);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBill = async (name: string, planned_amount: number) => {
    if (!user || !budgetPeriodId) return;

    try {
      const { data, error } = await supabase
        .from('budget_bills')
        .insert([{
          user_id: user.id,
          budget_period_id: budgetPeriodId,
          name,
          planned_amount,
          actual_amount: 0,
          is_paid: false
        }])
        .select()
        .single();

      if (error) throw error;
      setBills(prev => [...prev, data as BudgetBill]);
      return data;
    } catch (error) {
      console.error('Error adding bill:', error);
      toast({
        title: "Error",
        description: "Failed to add bill",
        variant: "destructive",
      });
    }
  };

  const updateBill = async (id: string, updates: Partial<Pick<BudgetBill, 'name' | 'planned_amount' | 'actual_amount' | 'is_paid'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budget_bills')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setBills(prev => prev.map(bill => bill.id === id ? data as BudgetBill : bill));
      return data;
    } catch (error) {
      console.error('Error updating bill:', error);
      toast({
        title: "Error",
        description: "Failed to update bill",
        variant: "destructive",
      });
    }
  };

  const deleteBill = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budget_bills')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setBills(prev => prev.filter(bill => bill.id !== id));
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: "Error",
        description: "Failed to delete bill",
        variant: "destructive",
      });
    }
  };

  const getTotalPlanned = () => bills.reduce((sum, b) => sum + b.planned_amount, 0);
  const getTotalActual = () => bills.reduce((sum, b) => sum + b.actual_amount, 0);
  const getOverallProgress = () => {
    const planned = getTotalPlanned();
    return planned > 0 ? (getTotalActual() / planned) * 100 : 0;
  };

  useEffect(() => {
    fetchBills();
  }, [user, budgetPeriodId]);

  return {
    bills,
    loading,
    addBill,
    updateBill,
    deleteBill,
    getTotalPlanned,
    getTotalActual,
    getOverallProgress,
    refetch: fetchBills,
  };
};
