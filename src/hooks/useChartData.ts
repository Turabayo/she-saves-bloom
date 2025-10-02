
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useChartData = () => {
  const { user } = useAuth();

  const { data: transactionData = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions-chart", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: topupData = [], isLoading: topupsLoading } = useQuery({
    queryKey: ["topups-chart", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("topups")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: withdrawalData = [], isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["withdrawals-chart", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: savingsData = [], isLoading: savingsLoading } = useQuery({
    queryKey: ["savings-chart", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("savings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Process data for charts - show all data regardless of date range for better visualization
  const dailyVolumeData = () => {
    const dateMap = new Map();
    
    console.log('Processing chart data...');
    console.log('Topup data length:', topupData.length);
    console.log('Withdrawal data length:', withdrawalData.length);
    
    // Process ALL topups (not just last 30 days) - show all data for better insights
    topupData.forEach(topup => {
      const date = new Date(topup.created_at);
      const dateKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: '2-digit'
      });
      const existing = dateMap.get(dateKey) || { 
        date: dateKey, 
        topups: 0, 
        withdrawals: 0,
        sortDate: date
      };
      existing.topups += Number(topup.amount) || 0;
      dateMap.set(dateKey, existing);
    });
    
    // Process ALL withdrawals
    withdrawalData.forEach(withdrawal => {
      const date = new Date(withdrawal.created_at);
      const dateKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: '2-digit'
      });
      const existing = dateMap.get(dateKey) || { 
        date: dateKey, 
        topups: 0, 
        withdrawals: 0,
        sortDate: date
      };
      existing.withdrawals += Number(withdrawal.amount) || 0;
      dateMap.set(dateKey, existing);
    });
    
    const result = Array.from(dateMap.values())
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .map(({ sortDate, ...rest }) => rest);
    
    console.log('Daily volume data result:', result);
    return result;
  };

  // Combine all transaction data for monthly amounts
  const transactionAmountData = () => {
    const allTransactions = [
      ...transactionData.map(t => ({ ...t, type: 'transaction' })),
      ...topupData.map(t => ({ ...t, type: 'topup' })),
      ...withdrawalData.map(w => ({ ...w, type: 'withdrawal' }))
    ];

    return allTransactions.reduce((acc: any[], item) => {
      const month = new Date(item.created_at).toLocaleDateString('en-US', { 
        month: 'short',
        year: '2-digit'
      });
      const existingEntry = acc.find(entry => entry.month === month);
      const amount = Number(item.amount) || 0;
      
      if (existingEntry) {
        existingEntry.amount += amount;
      } else {
        acc.push({ month, amount });
      }
      return acc;
    }, []).sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.month + ' 01');
      const dateB = new Date(b.month + ' 01');
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Count all transactions by type (including failed ones for transparency)
  const transactionTypeData = [
    { 
      name: "Top-ups", 
      value: topupData.length, 
      color: "#8B5CF6" 
    },
    { 
      name: "Withdrawals", 
      value: withdrawalData.length,
      color: "hsl(var(--primary))" 
    },
    { 
      name: "Savings", 
      value: savingsData.length, 
      color: "#6366F1" 
    }
  ].filter(item => item.value > 0);

  return {
    dailyVolumeData: dailyVolumeData(),
    transactionAmountData: transactionAmountData(),
    transactionTypeData,
    isLoading: transactionsLoading || topupsLoading || withdrawalsLoading || savingsLoading
  };
};
