
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

      // Calculate proper monthly average based on actual calendar months with data
      let monthlyAverage = 0;
      
      if (totalSavings > 0) {
        // Get all unique months that have any activity (savings, topups, or withdrawals)
        const monthsWithActivity = new Set<string>();
        
        // Add months from successful savings
        savings
          .filter(saving => saving.status === 'success')
          .forEach(saving => {
            const date = new Date(saving.created_at);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            monthsWithActivity.add(monthKey);
          });

        // Add months from all topups (to track activity regardless of success)
        allTopUps.forEach(topup => {
          const date = new Date(topup.created_at);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          monthsWithActivity.add(monthKey);
        });

        // Add months from all withdrawals (to track activity)
        allWithdrawals.forEach(withdrawal => {
          const date = new Date(withdrawal.created_at);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          monthsWithActivity.add(monthKey);
        });

        // If no months found, calculate based on time since first transaction
        let totalMonthsWithActivity = monthsWithActivity.size;
        
        if (totalMonthsWithActivity === 0) {
          // Find the earliest transaction date across all data
          const allDates = [
            ...savings.map(s => new Date(s.created_at)),
            ...allTopUps.map(t => new Date(t.created_at)),
            ...allWithdrawals.map(w => new Date(w.created_at))
          ].sort((a, b) => a.getTime() - b.getTime());
          
          if (allDates.length > 0) {
            const firstDate = allDates[0];
            const now = new Date();
            const monthsDiff = (now.getFullYear() - firstDate.getFullYear()) * 12 + (now.getMonth() - firstDate.getMonth()) + 1;
            totalMonthsWithActivity = Math.max(monthsDiff, 1);
          } else {
            totalMonthsWithActivity = 1;
          }
        }

        monthlyAverage = totalSavings / totalMonthsWithActivity;

        console.log('Months with activity:', monthsWithActivity.size);
        console.log('Total months for calculation:', totalMonthsWithActivity);
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
