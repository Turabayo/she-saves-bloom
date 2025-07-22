import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
  created_at: string;
}

export interface ExpenseInput {
  amount: number;
  category: string;
  note?: string;
  date: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchExpenses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching expenses",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: ExpenseInput) => {
    if (!user) return false;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Expense added successfully",
        description: "Your expense has been recorded."
      });

      await fetchExpenses();
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Expense deleted",
        description: "The expense has been removed."
      });

      await fetchExpenses();
    } catch (error: any) {
      toast({
        title: "Error deleting expense",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  return {
    expenses,
    loading,
    submitting,
    addExpense,
    deleteExpense,
    refreshExpenses: fetchExpenses
  };
};