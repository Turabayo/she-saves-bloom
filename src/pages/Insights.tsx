
import Navigation from "@/components/Navigation";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTransactionInsights } from "@/hooks/useTransactionInsights";
import { useChartData } from "@/hooks/useChartData";
import { formatCurrency } from "@/utils/dateFormatter";
import { TrendingUp, DollarSign, Target, Activity, Users, CreditCard } from "lucide-react";

const Insights = () => {
  const { insights, loading } = useTransactionInsights();
  const { 
    dailyVolumeData, 
    transactionAmountData, 
    transactionTypeData, 
    agentPerformanceData, 
    isLoading: chartLoading 
  } = useChartData();

  if (loading || chartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="py-6 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading insights...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Always show charts with default data if no insights available
  const defaultInsights = {
    transactionCount: 0,
    savingsGrowth: 0,
    monthlyAverage: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    topCategories: []
  };

  const currentInsights = insights || defaultInsights;

  // Prepare chart data from insights
  const monthlyData = currentInsights.topCategories.length > 0 
    ? currentInsights.topCategories.slice(0, 6).map((category, index) => ({
        month: `Category ${index + 1}`,
        amount: category.amount,
        name: category.category
      }))
    : [
        { month: 'Category 1', amount: 0, name: 'No data' }
      ];

  const categoryData = currentInsights.topCategories.length > 0 
    ? currentInsights.topCategories.map((category, index) => ({
        name: category.category,
        value: category.amount,
        count: category.count,
        color: `hsl(${(index * 45) % 360}, 70%, 50%)`
      }))
    : [
        { name: 'No data', value: 1, count: 0, color: 'hsl(var(--chart-1))' }
      ];

  const performanceData = [
    { name: 'Deposits', value: currentInsights.totalDeposits, color: 'hsl(var(--chart-1))' },
    { name: 'Withdrawals', value: currentInsights.totalWithdrawals, color: 'hsl(var(--chart-2))' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Insights</h1>
            <p className="text-muted-foreground">Review your savings performance and trends</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={24} className="text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Total Savings Growth</span>
              </div>
               <h3 className="text-2xl font-bold text-card-foreground">
                 {formatCurrency(currentInsights.savingsGrowth)}
               </h3>
             </div>

             <div className="bg-card rounded-xl p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-2">
                 <TrendingUp size={24} className="text-blue-600" />
                 <span className="text-sm font-medium text-muted-foreground">Monthly Average</span>
               </div>
               <h3 className="text-2xl font-bold text-card-foreground">
                 {formatCurrency(currentInsights.monthlyAverage)}
               </h3>
             </div>

             <div className="bg-card rounded-xl p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-2">
                 <Target size={24} className="text-purple-600" />
                 <span className="text-sm font-medium text-muted-foreground">Total Deposits</span>
               </div>
               <h3 className="text-2xl font-bold text-card-foreground">
                 {formatCurrency(currentInsights.totalDeposits)}
               </h3>
             </div>

             <div className="bg-card rounded-xl p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-2">
                 <Activity size={24} className="text-orange-600" />
                 <span className="text-sm font-medium text-muted-foreground">Transactions</span>
               </div>
               <h3 className="text-2xl font-bold text-card-foreground">
                 {currentInsights.transactionCount}
               </h3>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-6">
            {/* Daily Transaction Volume */}
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Daily Transaction Volume</h3>
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
                    <Line type="monotone" dataKey="topup" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Top-ups" />
                    <Line type="monotone" dataKey="withdrawal" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Withdrawals" />
                    <Line type="monotone" dataKey="transfer" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Transfers" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Transaction Amount */}
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Daily Transaction Amount</h3>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transaction Types */}
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Transaction Types</h3>
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

              {/* Agent Performance */}
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Top Agents by Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentPerformanceData || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
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
                        formatter={(value) => [value, 'Count']}
                      />
                      <Legend />
                      <Bar dataKey="deposits" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} name="Deposits" />
                      <Bar dataKey="withdrawals" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} name="Withdrawals" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Savings by Category from Transaction Insights */}
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Savings by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
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
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Savings Distribution</h3>
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
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Deposits vs Withdrawals</h3>
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
