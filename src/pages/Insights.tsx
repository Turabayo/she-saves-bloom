
import Navigation from "@/components/Navigation";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTransactionInsights } from "@/hooks/useTransactionInsights";
import { useChartData } from "@/hooks/useChartData";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { formatCurrency, formatCurrencyCompact } from "@/utils/dateFormatter";
import { useRealSavingsInsights } from "@/hooks/useRealSavingsInsights";
import { TrendingUp, DollarSign, Target, Activity } from "lucide-react";

const Insights = () => {
  const { insights: realInsights, loading } = useRealSavingsInsights();
  const { goals, loading: goalsLoading } = useSavingsGoals();
  const { 
    dailyVolumeData, 
    transactionAmountData, 
    transactionTypeData, 
    isLoading: chartLoading 
  } = useChartData();

  if (loading || chartLoading || goalsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="py-6 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading insights...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Use real savings insights
  const currentInsights = realInsights || {
    totalSavings: 0,
    monthlyAverage: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    savingsGrowth: 0,
    transactionCount: 0
  };

  // Prepare savings by category data from goals
  const savingsByCategoryData = goals.length > 0 
    ? goals.map((goal) => ({
        name: goal.category,
        amount: goal.current_amount || 0,
        goal_amount: goal.goal_amount
      }))
    : [
        { name: 'No savings goals', amount: 0, goal_amount: 0 }
      ];

  // Prepare category distribution data from goals - group by category
  const categoryData = goals.length > 0 
    ? (() => {
        const categoryMap = new Map();
        goals.forEach((goal) => {
          const existing = categoryMap.get(goal.category) || 0;
          categoryMap.set(goal.category, existing + (goal.current_amount || 0));
        });
        
        return Array.from(categoryMap.entries())
          .filter(([_, value]) => value > 0) // Only show categories with savings
          .map(([category, amount], index) => ({
            name: category,
            value: amount,
            color: `hsl(var(--chart-${(index % 5) + 1}))`
          }));
      })()
    : [
        { name: 'No data', value: 1, color: 'hsl(var(--chart-1))' }
      ];

  // Enhanced deposits vs withdrawals data
  const performanceData = [
    { 
      name: 'Deposits', 
      value: currentInsights.totalDeposits > 0 ? currentInsights.totalDeposits : 0,
      color: 'hsl(var(--chart-1))' 
    },
    { 
      name: 'Withdrawals', 
      value: currentInsights.totalWithdrawals > 0 ? currentInsights.totalWithdrawals : 0,
      color: 'hsl(var(--chart-2))' 
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-white mb-2">Insights</h1>
            <p className="text-slate-400">Review your savings performance and trends</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
             <div className="bg-card rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign size={24} className="text-primary" />
                    <span className="text-sm font-medium text-slate-400">Total Savings Growth</span>
                  </div>
                 <h3 className="text-xl md:text-2xl font-bold text-white">
                    {formatCurrencyCompact(currentInsights.savingsGrowth)}
                  </h3>
              </div>

             <div className="bg-card rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={24} className="text-secondary" />
                  <span className="text-sm font-medium text-slate-400">Monthly Average</span>
                </div>
                 <h3 className="text-xl md:text-2xl font-bold text-white">
                   {formatCurrencyCompact(currentInsights.monthlyAverage)}
                 </h3>
             </div>

             <div className="bg-card rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Target size={24} className="text-accent" />
                  <span className="text-sm font-medium text-slate-400">Total Deposits</span>
                </div>
                 <h3 className="text-xl md:text-2xl font-bold text-white">
                   {formatCurrencyCompact(currentInsights.totalDeposits)}
                 </h3>
             </div>

             <div className="bg-card rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Activity size={24} className="text-secondary" />
                  <span className="text-sm font-medium text-slate-400">Transactions</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {currentInsights.transactionCount}
                </h3>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-6">
            {/* Daily Transaction Volume */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Daily Transaction Volume</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyVolumeData || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="topups" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Top-ups" />
                    <Line type="monotone" dataKey="withdrawals" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Withdrawals" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Transaction Amount */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Daily Transaction Amount</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transactionAmountData || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${(value/1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${Number(value).toLocaleString()} RWF`, 'Amount']}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transaction Types */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Transaction Types</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={transactionTypeData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(transactionTypeData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index % 5 + 1}))`} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [value, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Savings by Category */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Savings by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={savingsByCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${(value/1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${Number(value).toLocaleString()} RWF`, 'Amount']}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Savings Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`${Number(value).toLocaleString()} RWF`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Deposits vs Withdrawals */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Deposits vs Withdrawals</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`${Number(value).toLocaleString()} RWF`, 'Amount']}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;
