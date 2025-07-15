import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InvestmentGrowthData {
  month: string;
  value: number;
}

export interface InvestmentInsights {
  totalNetWorth: number;
  growthData: InvestmentGrowthData[];
  hasData: boolean;
}

export const useInvestmentInsights = () => {
  const [insights, setInsights] = useState<InvestmentInsights>({
    totalNetWorth: 0,
    growthData: [],
    hasData: false
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchInsights = async () => {
    if (!user) return;

    try {
      // Get all investments
      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (investmentsError) throw investmentsError;

      if (!investments || investments.length === 0) {
        setInsights({
          totalNetWorth: 0,
          growthData: [],
          hasData: false
        });
        return;
      }

      // Calculate total net worth
      const totalNetWorth = investments.reduce((sum, inv) => sum + inv.amount, 0);

      // Generate growth data by month
      const monthlyData = new Map<string, number>();
      let runningTotal = 0;

      investments.forEach(investment => {
        const date = new Date(investment.created_at);
        const monthKey = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        runningTotal += investment.amount;
        monthlyData.set(monthKey, runningTotal);
      });

      const growthData = Array.from(monthlyData.entries()).map(([month, value]) => ({
        month,
        value
      }));

      setInsights({
        totalNetWorth,
        growthData,
        hasData: true
      });

    } catch (error) {
      console.error('Error fetching investment insights:', error);
      setInsights({
        totalNetWorth: 0,
        growthData: [],
        hasData: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [user]);

  return {
    insights,
    loading,
    refetch: fetchInsights
  };
};