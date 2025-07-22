import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ScheduledSaving {
  id: string;
  user_id: string;
  goal_id?: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'one-time';
  next_execution_date: string;
  is_active: boolean;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useScheduledSavings = () => {
  const [scheduledSavings, setScheduledSavings] = useState<ScheduledSaving[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchScheduledSavings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_savings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('next_execution_date', { ascending: true });

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
  };

  const addScheduledSaving = async (savingData: Omit<ScheduledSaving, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_savings')
        .insert([{ ...savingData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setScheduledSavings(prev => [...prev, data as ScheduledSaving]);
      toast({
        title: "Success",
        description: "Scheduled saving created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding scheduled saving:', error);
      toast({
        title: "Error",
        description: "Failed to create scheduled saving",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateScheduledSaving = async (id: string, updates: Partial<Omit<ScheduledSaving, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_savings')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setScheduledSavings(prev => prev.map(item => item.id === id ? data as ScheduledSaving : item));
      toast({
        title: "Success",
        description: "Scheduled saving updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating scheduled saving:', error);
      toast({
        title: "Error",
        description: "Failed to update scheduled saving",
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
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setScheduledSavings(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Scheduled saving deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting scheduled saving:', error);
      toast({
        title: "Error",
        description: "Failed to delete scheduled saving",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getUpcomingSavings = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return scheduledSavings.filter(saving => {
      const executionDate = new Date(saving.next_execution_date);
      return executionDate <= nextWeek && saving.is_active;
    });
  };

  useEffect(() => {
    fetchScheduledSavings();
  }, [user]);

  return {
    scheduledSavings,
    loading,
    addScheduledSaving,
    updateScheduledSaving,
    deleteScheduledSaving,
    getUpcomingSavings,
    refetch: fetchScheduledSavings,
  };
};