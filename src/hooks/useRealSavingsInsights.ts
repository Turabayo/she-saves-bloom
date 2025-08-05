
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

      // Calculate total deposits from ALL topups (not just successful ones since we need the real total)
      // But filter for successful ones to match the actual money deposited
      const successfulTopUps = topUps.filter(topup => 
        topup.status === 'SUCCESSFUL' || topup.status === 'success' || topup.status === 'completed'
      );
      
      const totalDeposits = successfulTopUps.reduce((sum, topup) => sum + topup.amount, 0);

      console.log('Successful topups:', successfulTopUps);
      console.log('Total deposits calculated:', totalDeposits);

      // Calculate total withdrawals (completed/successful only)
      const successfulWithdrawals = withdrawals.filter(withdrawal => 
        withdrawal.status === 'completed' || withdrawal.status === 'success'
      );
      
      const totalWithdrawals = successfulWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

      console.log('Total withdrawals calculated:', totalWithdrawals);

      // Calculate proper monthly average based on actual calendar months with data
      let monthlyAverage = 0;
      
      if (totalSavings > 0) {
        // Get all unique months that have savings data
        const monthsWithSavings = new Set<string>();
        
        savings
          .filter(saving => saving.status === 'success')
          .forEach(saving => {
            const date = new Date(saving.created_at);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            monthsWithSavings.add(monthKey);
          });

        // Also consider months with topups
        successfulTopUps.forEach(topup => {
          const date = new Date(topup.created_at);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          monthsWithSavings.add(monthKey);
        });

        const totalMonthsWithActivity = Math.max(monthsWithSavings.size, 1);
        monthlyAverage = totalSavings / totalMonthsWithActivity;

        console.log('Months with activity:', monthsWithSavings.size);
        console.log('Monthly average calculated:', monthlyAverage);
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
