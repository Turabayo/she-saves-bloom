
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

      console.log('=== CALCULATING INSIGHTS ===');
      console.log('Savings data:', savings);
      console.log('TopUps data:', topUps);
      console.log('Withdrawals data:', withdrawals);

      // Calculate total savings from savings table (successful only)
      const totalSavings = savings
        .filter(saving => saving.status === 'success')
        .reduce((sum, saving) => sum + saving.amount, 0);

      console.log('Total savings calculated:', totalSavings);

      // Calculate total deposits from topups - include all statuses for chart display
      const allTopUps = topUps || [];
      
      // For actual money calculations, only count successful ones
      const successfulTopUps = topUps.filter(topup => 
        topup.status === 'SUCCESSFUL' || topup.status === 'success' || topup.status === 'completed'
      );
      
      // For insights, show total deposit attempts (including failed ones for transparency)
      const totalDeposits = allTopUps.reduce((sum, topup) => sum + topup.amount, 0);

      console.log('Successful topups:', successfulTopUps);
      console.log('Total deposits calculated:', totalDeposits);

      // Calculate total withdrawals - include all attempts for transparency
      const allWithdrawals = withdrawals || [];
      const totalWithdrawals = allWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

      console.log('Total withdrawals calculated:', totalWithdrawals);

      // Calculate monthly average based on successful deposits per month
      let monthlyAverage = 0;
      
      if (successfulTopUps.length > 0) {
        // Group successful topups by month
        const monthlyTotals = new Map<string, number>();
        
        successfulTopUps.forEach(topup => {
          const date = new Date(topup.created_at);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          const currentTotal = monthlyTotals.get(monthKey) || 0;
          monthlyTotals.set(monthKey, currentTotal + topup.amount);
        });

        // Calculate average of monthly totals
        const monthlyAmounts = Array.from(monthlyTotals.values());
        monthlyAverage = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length;

        console.log('Monthly totals:', Object.fromEntries(monthlyTotals));
        console.log('Monthly amounts:', monthlyAmounts);
        console.log('Monthly average calculated:', monthlyAverage);
      } else {
        console.log('No successful topups found for monthly average calculation');
      }

      // Savings growth is total deposits minus withdrawals
      const savingsGrowth = totalDeposits - totalWithdrawals;

      // Transaction count
      const transactionCount = topUps.length + withdrawals.length + savings.length;

      const calculatedInsights = {
        totalSavings,
        monthlyAverage,
        totalDeposits,
        totalWithdrawals,
        savingsGrowth,
        transactionCount
      };

      console.log('Final calculated insights:', calculatedInsights);

      setInsights(calculatedInsights);

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
