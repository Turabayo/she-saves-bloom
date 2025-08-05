
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TopUp {
  id: string;
  amount: number;
  phone_number: string;
  currency: string;
  status: string;
  created_at: string;
  momo_reference_id: string;
  external_id: string;
  momo_transaction_id: string | null;
  payer_message: string | null;
  payee_note: string | null;
  updated_at: string;
  user_id: string;
}

export const useTopUps = () => {
  const [topUps, setTopUps] = useState<TopUp[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTopUps = async () => {
    if (!user) return;

    try {
      // Fetch ALL topups for proper insights calculation, not just successful ones
      const { data, error } = await supabase
        .from('topups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched topups:', data);
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
    // Only count successful topups for total savings
    return topUps
      .filter(topUp => topUp.status === 'SUCCESSFUL' || topUp.status === 'success')
      .reduce((total, topUp) => total + topUp.amount, 0);
  };

  const getMonthlyAverage = () => {
    const successfulTopUps = topUps.filter(topUp => 
      topUp.status === 'SUCCESSFUL' || topUp.status === 'success'
    );
    
    if (successfulTopUps.length === 0) return 0;
    
    const monthsData = new Map();
    
    successfulTopUps.forEach(topUp => {
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
