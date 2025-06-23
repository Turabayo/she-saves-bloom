
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Investment {
  id: string;
  name: string;
  amount: number;
  target_amount?: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

export const useInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInvestments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching investments",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([
          {
            ...investment,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setInvestments(prev => [data, ...prev]);
      toast({
        title: "Investment added successfully!",
        description: `${investment.name} has been added to your portfolio.`
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error adding investment",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const getTotalSavings = () => {
    return investments.reduce((total, investment) => total + investment.amount, 0);
  };

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  return {
    investments,
    loading,
    addInvestment,
    getTotalSavings,
    refetch: fetchInvestments
  };
};
