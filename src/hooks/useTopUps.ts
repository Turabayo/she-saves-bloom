import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TopUp {
  id: string;
  amount: number;
  phone: string;
  currency: string;
  status: string;
  created_at: string;
  reference_id: string;
}

export const useTopUps = () => {
  const [topUps, setTopUps] = useState<TopUp[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTopUps = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('momo_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'SUCCESSFUL')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopUps(data || []);
    } catch (error: any) {
      console.error('Error fetching top-ups:', error);
      toast({
        title: "Error fetching top-ups",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalSavings = () => {
    return topUps.reduce((total, topUp) => total + topUp.amount, 0);
  };

  const getMonthlyAverage = () => {
    if (topUps.length === 0) return 0;
    
    const now = new Date();
    const monthsData = new Map();
    
    topUps.forEach(topUp => {
      const date = new Date(topUp.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthsData.has(monthKey)) {
        monthsData.set(monthKey, 0);
      }
      monthsData.set(monthKey, monthsData.get(monthKey) + topUp.amount);
    });

    const totalMonths = Math.max(monthsData.size, 1);
    return getTotalSavings() / totalMonths;
  };

  useEffect(() => {
    fetchTopUps();
  }, [user]);

  return {
    topUps,
    loading,
    getTotalSavings,
    getMonthlyAverage,
    refetch: fetchTopUps
  };
};