
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TransactionInsight {
  totalDeposits: number;
  totalWithdrawals: number;
  monthlyAverage: number;
  savingsGrowth: number;
  transactionCount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
}

export const useTransactionInsights = () => {
  const [insights, setInsights] = useState<TransactionInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchInsights = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get transactions from last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!transactions || transactions.length === 0) {
        setInsights({
          totalDeposits: 0,
          totalWithdrawals: 0,
          monthlyAverage: 0,
          savingsGrowth: 0,
          transactionCount: 0,
          topCategories: []
        });
        return;
      }

      // Calculate insights
      const deposits = transactions.filter(t => t.type === 'deposit');
      const withdrawals = transactions.filter(t => t.type === 'withdrawal');

      const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
      const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.amount, 0);
      const monthlyAverage = totalDeposits / 6; // Last 6 months
      const savingsGrowth = totalDeposits - totalWithdrawals;

      // Group by goal categories
      const categoryMap = new Map();
      
      for (const transaction of transactions) {
        if (transaction.goal_id) {
          // Get goal details
          const { data: goal } = await supabase
            .from('savings_goals')
            .select('category')
            .eq('id', transaction.goal_id)
            .single();

          const category = goal?.category || 'General';
          const existing = categoryMap.get(category) || { amount: 0, count: 0 };
          categoryMap.set(category, {
            amount: existing.amount + transaction.amount,
            count: existing.count + 1
          });
        }
      }

      const topCategories = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      setInsights({
        totalDeposits,
        totalWithdrawals,
        monthlyAverage,
        savingsGrowth,
        transactionCount: transactions.length,
        topCategories
      });

    } catch (error) {
      console.error('Error fetching transaction insights:', error);
      setInsights(null);
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
