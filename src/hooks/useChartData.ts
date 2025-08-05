
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

  // Process data for charts - combine topups and withdrawals by date with proper date handling
  const dailyVolumeData = () => {
    const dateMap = new Map();
    
    // Get current date and calculate 30 days ago properly
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);
    
    console.log('Current date:', currentDate.toISOString());
    console.log('Filtering from:', thirtyDaysAgo.toISOString());
    
    // Process topups - use actual amounts from database
    topupData.forEach(topup => {
      const date = new Date(topup.created_at);
      
      // Only include data from the last 30 days
      if (date >= thirtyDaysAgo && date <= currentDate) {
        const dateKey = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        });
        const existing = dateMap.get(dateKey) || { 
          date: dateKey, 
          topups: 0, 
          withdrawals: 0,
          sortDate: date
        };
        existing.topups += Number(topup.amount) || 0;
        dateMap.set(dateKey, existing);
      }
    });
    
    // Process withdrawals - use actual amounts from database
    withdrawalData.forEach(withdrawal => {
      const date = new Date(withdrawal.created_at);
      
      // Only include data from the last 30 days
      if (date >= thirtyDaysAgo && date <= currentDate) {
        const dateKey = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        });
        const existing = dateMap.get(dateKey) || { 
          date: dateKey, 
          topups: 0, 
          withdrawals: 0,
          sortDate: date
        };
        existing.withdrawals += Number(withdrawal.amount) || 0;
        dateMap.set(dateKey, existing);
      }
    });
    
    return Array.from(dateMap.values())
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
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

  // Only count successful transactions in the pie chart
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

  return {
    dailyVolumeData: dailyVolumeData(),
    transactionAmountData,
    transactionTypeData,
    isLoading: transactionsLoading || topupsLoading || withdrawalsLoading || savingsLoading
  };
};
