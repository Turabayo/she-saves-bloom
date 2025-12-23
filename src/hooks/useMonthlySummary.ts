import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

interface MonthlySummary {
  month: string;
  totalSaved: number;
  totalWithdrawn: number;
  netSavings: number;
  goalsProgress: {
    name: string;
    progress: number;
    saved: number;
  }[];
  autoSavingsExecuted: number;
  autoSavingsAmount: number;
  savingsVsSpendingRatio: number;
}

export const useMonthlySummary = (monthOffset: number = 0) => {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const targetDate = useMemo(() => subMonths(new Date(), monthOffset), [monthOffset]);
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch topups for the month
        const { data: topups } = await supabase
          .from('topups')
          .select('amount, status')
          .eq('user_id', user.id)
          .eq('status', 'SUCCESSFUL')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        const totalSaved = (topups || []).reduce((sum, t) => sum + Number(t.amount), 0);

        // Fetch withdrawals for the month
        const { data: withdrawals } = await supabase
          .from('withdrawals')
          .select('amount, status')
          .eq('user_id', user.id)
          .eq('status', 'SUCCESSFUL')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        const totalWithdrawn = (withdrawals || []).reduce((sum, w) => sum + Number(w.amount), 0);

        // Fetch savings goals with their current amounts
        const { data: goals } = await supabase
          .from('savings_goals')
          .select('id, name, goal_amount')
          .eq('user_id', user.id);

        const { data: savings } = await supabase
          .from('savings')
          .select('goal_id, amount')
          .eq('user_id', user.id);

        const goalsProgress = (goals || []).map(goal => {
          const goalSavings = (savings || [])
            .filter(s => s.goal_id === goal.id)
            .reduce((sum, s) => sum + Number(s.amount), 0);
          
          return {
            name: goal.name,
            progress: Math.min(100, Math.round((goalSavings / goal.goal_amount) * 100)),
            saved: goalSavings
          };
        });

        // Fetch scheduled savings executions for the month
        const { data: scheduled } = await supabase
          .from('scheduled_savings')
          .select('amount, last_executed_at')
          .eq('user_id', user.id)
          .gte('last_executed_at', monthStart.toISOString())
          .lte('last_executed_at', monthEnd.toISOString());

        const autoSavingsExecuted = scheduled?.length || 0;
        const autoSavingsAmount = (scheduled || []).reduce((sum, s) => sum + Number(s.amount), 0);

        // Fetch expenses for the month
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)
          .gte('date', format(monthStart, 'yyyy-MM-dd'))
          .lte('date', format(monthEnd, 'yyyy-MM-dd'));

        const totalExpenses = (expenses || []).reduce((sum, e) => sum + Number(e.amount), 0);
        const savingsVsSpendingRatio = totalExpenses > 0 
          ? Math.round((totalSaved / (totalSaved + totalExpenses)) * 100)
          : totalSaved > 0 ? 100 : 0;

        setSummary({
          month: format(targetDate, 'MMMM yyyy'),
          totalSaved,
          totalWithdrawn,
          netSavings: totalSaved - totalWithdrawn,
          goalsProgress,
          autoSavingsExecuted,
          autoSavingsAmount,
          savingsVsSpendingRatio
        });
      } catch (error) {
        console.error('Error fetching monthly summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user, monthStart, monthEnd, targetDate]);

  return { summary, loading };
};
