import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Income {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  note?: string;
  date: string;
  created_at: string;
}

export const useIncome = () => {
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchIncome = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setIncome(data || []);
    } catch (error) {
      console.error('Error fetching income:', error);
      toast({
        title: "Error",
        description: "Failed to fetch income data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addIncome = async (incomeData: Omit<Income, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income')
        .insert([{ ...incomeData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setIncome(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Income added successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: "Error",
        description: "Failed to add income",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateIncome = async (id: string, updates: Partial<Omit<Income, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setIncome(prev => prev.map(item => item.id === id ? data : item));
      toast({
        title: "Success",
        description: "Income updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating income:', error);
      toast({
        title: "Error",
        description: "Failed to update income",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteIncome = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setIncome(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Income deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting income:', error);
      toast({
        title: "Error",
        description: "Failed to delete income",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getTotalIncome = () => {
    return income.reduce((total, item) => total + Number(item.amount), 0);
  };

  useEffect(() => {
    fetchIncome();
  }, [user]);

  return {
    income,
    loading,
    addIncome,
    updateIncome,
    deleteIncome,
    getTotalIncome,
    refetch: fetchIncome,
  };
};