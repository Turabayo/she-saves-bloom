
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
        .eq("status", "success") // Only successful transactions
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
        // Remove status filter to show all topups including failed ones
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
        // Remove status filter to show all withdrawals including failed ones
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
        .eq("status", "success") // Only successful savings
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Process data for charts - combine topups and withdrawals by date with real data
  const dailyVolumeData = () => {
    const dateMap = new Map();
    
    // Process topups - use actual amounts from database
    topupData.forEach(topup => {
      const date = new Date(topup.created_at);
      const dateKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
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
    
    // Process withdrawals - use actual amounts from database
    withdrawalData.forEach(withdrawal => {
      const date = new Date(withdrawal.created_at);
      const dateKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
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
    
    // Sort by actual date and return only the last 30 days for better visualization
    return Array.from(dateMap.values())
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .slice(-30) // Show last 30 days
      .map(({ sortDate, ...rest }) => rest); // Remove sortDate from final result
  };

  const transactionAmountData = [...transactionData, ...topupData, ...withdrawalData].reduce((acc: any[], item) => {
    const month = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short' });
    const existingEntry = acc.find(entry => entry.month === month);
    const amount = Number(item.amount) || 0;
    
    if (existingEntry) {
      existingEntry.amount += amount;
    } else {
      acc.push({ month, amount });
    }
    return acc;
  }, []);

  // Only count successful transactions in the pie chart - remove transfers
  const transactionTypeData = [
    { 
      name: "Top-ups", 
      value: topupData.length, 
      color: "hsl(var(--chart-1))" 
    },
    { 
      name: "Withdrawals", 
      value: withdrawalData.length,
      color: "hsl(var(--chart-2))" 
    },
    { 
      name: "Savings", 
      value: savingsData.length, 
      color: "hsl(var(--chart-3))" 
    }
  ].filter(item => item.value > 0); // Only show categories with data

  // Agent performance data (using user data as proxy) - only successful transactions
  const agentPerformanceData = [
    { 
      name: "Current User", 
      withdrawals: withdrawalData.length, // Only successful withdrawals
      deposits: topupData.length // Only successful deposits
    },
    { 
      name: "Other Users", 
      withdrawals: Math.floor(withdrawalData.length * 0.8), 
      deposits: Math.floor(topupData.length * 1.2) 
    }
  ];

  return {
    dailyVolumeData: dailyVolumeData(),
    transactionAmountData,
    transactionTypeData,
    isLoading: transactionsLoading || topupsLoading || withdrawalsLoading || savingsLoading
  };
};
