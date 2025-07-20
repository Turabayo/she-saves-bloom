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

  // Process data for charts
  const dailyVolumeData = transactionData.reduce((acc: any[], transaction) => {
    const date = new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const existingEntry = acc.find(entry => entry.date === date);
    
    if (existingEntry) {
      existingEntry[transaction.type] = (existingEntry[transaction.type] || 0) + 1;
    } else {
      acc.push({
        date,
        [transaction.type]: 1,
        topup: 0,
        withdrawal: 0,
        transfer: 0
      });
    }
    return acc;
  }, []);

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
    },
    { 
      name: "Transactions", 
      value: transactionData.length, 
      color: "hsl(var(--chart-4))" 
    }
  ];

  // Agent performance data (using user data as proxy)
  const agentPerformanceData = [
    { 
      name: "Current User", 
      withdrawals: withdrawalData.length, 
      deposits: topupData.length 
    },
    { 
      name: "Other Users", 
      withdrawals: Math.floor(withdrawalData.length * 0.8), 
      deposits: Math.floor(topupData.length * 1.2) 
    }
  ];

  return {
    dailyVolumeData,
    transactionAmountData,
    transactionTypeData,
    agentPerformanceData,
    isLoading: transactionsLoading || topupsLoading || withdrawalsLoading || savingsLoading
  };
};