import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSavings } from '@/hooks/useSavings';
import { useTopUps } from '@/hooks/useTopUps';
import { useWithdrawals } from '@/hooks/useWithdrawals';

export interface RealSavingsInsight {
  totalSavings: number;
  monthlyAverage: number;
  totalDeposits: number;
  totalWithdrawals: number;
  savingsGrowth: number;
  transactionCount: number;
}

export const useRealSavingsInsights = () => {
  const [insights, setInsights] = useState<RealSavingsInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { savings, loading: savingsLoading } = useSavings();
  const { topUps, loading: topUpsLoading } = useTopUps();
  const { withdrawals, loading: withdrawalsLoading } = useWithdrawals();

  const calculateInsights = () => {
    if (!user || savingsLoading || topUpsLoading || withdrawalsLoading) {
      setLoading(true);
      return;
    }

    try {
      setLoading(true);

      // Calculate total savings from savings table
      const totalSavings = savings
        .filter(saving => saving.status === 'success')
        .reduce((sum, saving) => sum + saving.amount, 0);

      // Calculate total deposits from topups
      const totalDeposits = topUps.reduce((sum, topup) => sum + topup.amount, 0);

      // Calculate total withdrawals
      const totalWithdrawals = withdrawals
        .filter(withdrawal => withdrawal.status === 'completed' || withdrawal.status === 'success')
        .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

      // Calculate monthly average from savings data
      const monthsData = new Map<string, number>();
      
      savings.forEach(saving => {
        const date = new Date(saving.created_at);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!monthsData.has(monthKey)) {
          monthsData.set(monthKey, 0);
        }
        monthsData.set(monthKey, monthsData.get(monthKey)! + saving.amount);
      });

      const totalMonths = Math.max(monthsData.size, 1);
      const monthlyAverage = totalSavings / totalMonths;

      // Savings growth is total deposits minus withdrawals
      const savingsGrowth = totalDeposits - totalWithdrawals;

      // Transaction count
      const transactionCount = topUps.length + withdrawals.length + savings.length;

      setInsights({
        totalSavings,
        monthlyAverage,
        totalDeposits,
        totalWithdrawals,
        savingsGrowth,
        transactionCount
      });

    } catch (error) {
      console.error('Error calculating real savings insights:', error);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateInsights();
  }, [user, savings, topUps, withdrawals, savingsLoading, topUpsLoading, withdrawalsLoading]);

  return {
    insights,
    loading,
    refetch: calculateInsights
  };
};