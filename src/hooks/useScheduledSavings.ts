import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ScheduledSaving {
  id: string;
  user_id: string;
  goal_id?: string | null;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-time';
  next_execution_date: string;
  is_active: boolean;
  name: string;
  created_at: string;
  updated_at: string;
}

export type CreateScheduledSavingInput = {
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-time';
  goal_id?: string | null;
  next_execution_date: string;
  is_active?: boolean;
};

export const useScheduledSavings = () => {
  const [scheduledSavings, setScheduledSavings] = useState<ScheduledSaving[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchScheduledSavings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Fetch ALL scheduled savings (both active and inactive) for the user
      const { data, error } = await supabase
        .from('scheduled_savings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScheduledSavings((data || []) as ScheduledSaving[]);
    } catch (error) {
      console.error('Error fetching scheduled savings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scheduled savings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addScheduledSaving = async (savingData: CreateScheduledSavingInput) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_savings')
        .insert([{ 
          ...savingData, 
          user_id: user.id,
          is_active: savingData.is_active ?? true,
        }])
        .select()
        .single();

      if (error) throw error;

      setScheduledSavings(prev => [data as ScheduledSaving, ...prev]);
      toast({
        title: "Success",
        description: "Savings rule created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding scheduled saving:', error);
      toast({
        title: "Error",
        description: "Failed to create savings rule",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateScheduledSaving = async (id: string, updates: Partial<CreateScheduledSavingInput>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_savings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setScheduledSavings(prev => prev.map(item => item.id === id ? data as ScheduledSaving : item));
      return data;
    } catch (error) {
      console.error('Error updating scheduled saving:', error);
      toast({
        title: "Error",
        description: "Failed to update savings rule",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteScheduledSaving = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('scheduled_savings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setScheduledSavings(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Savings rule deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting scheduled saving:', error);
      toast({
        title: "Error",
        description: "Failed to delete savings rule",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getUpcomingSavings = useCallback(() => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return scheduledSavings.filter(saving => {
      const executionDate = new Date(saving.next_execution_date);
      return executionDate <= nextWeek && saving.is_active;
    });
  }, [scheduledSavings]);

  const getActiveRulesCount = useCallback(() => {
    return scheduledSavings.filter(s => s.is_active).length;
  }, [scheduledSavings]);

  const getMonthlyTotal = useCallback(() => {
    return scheduledSavings
      .filter(s => s.is_active)
      .reduce((total, saving) => {
        switch (saving.frequency) {
          case 'daily':
            return total + (saving.amount * 30);
          case 'weekly':
            return total + (saving.amount * 4);
          case 'monthly':
          case 'one-time':
            return total + saving.amount;
          default:
            return total + saving.amount;
        }
      }, 0);
  }, [scheduledSavings]);

  useEffect(() => {
    fetchScheduledSavings();
  }, [fetchScheduledSavings]);

  return {
    scheduledSavings,
    loading,
    addScheduledSaving,
    updateScheduledSaving,
    deleteScheduledSaving,
    getUpcomingSavings,
    getActiveRulesCount,
    getMonthlyTotal,
    refetch: fetchScheduledSavings,
  };
};