import Navigation from "@/components/Navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useChartData } from "@/hooks/useChartData";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { formatCurrencyCompact } from "@/utils/dateFormatter";
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
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <Navigation />
            <main className="flex-1 container mx-auto px-6 py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading insights...</p>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const currentInsights = realInsights || {
    totalSavings: 0,
    monthlyAverage: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    savingsGrowth: 0,
    transactionCount: 0
  };

  const savingsByCategoryData = goals.length > 0 
    ? goals.map((goal) => ({
        name: goal.category,
        amount: goal.current_amount || 0,
        goal_amount: goal.goal_amount
      }))
    : [{ name: 'No savings goals', amount: 0, goal_amount: 0 }];

  const categoryData = goals.length > 0 
    ? (() => {
        const categoryMap = new Map();
        goals.forEach((goal) => {
          const existing = categoryMap.get(goal.category) || 0;
          categoryMap.set(goal.category, existing + (goal.current_amount || 0));
        });
        
        return Array.from(categoryMap.entries())
          .filter(([_, value]) => value > 0)
          .map(([category, amount], index) => ({
            name: category,
            value: amount,
            color: `hsl(var(--chart-${(index % 5) + 1}))`
          }));
      })()
    : [{ name: 'No data', value: 1, color: 'hsl(var(--chart-1))' }];

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
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navigation />
          <main className="flex-1 container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Financial Insights</h1>
              <p className="text-muted-foreground">Track your savings performance and patterns</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign size={24} className="text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Total Savings Growth</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    {formatCurrencyCompact(currentInsights.savingsGrowth)}
                  </h3>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp size={24} className="text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Monthly Average</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    {formatCurrencyCompact(currentInsights.monthlyAverage)}
                  </h3>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Target size={24} className="text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Total Deposits</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    {formatCurrencyCompact(currentInsights.totalDeposits)}
                  </h3>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity size={24} className="text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Transactions</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {currentInsights.transactionCount}
                  </h3>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Transaction Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyVolumeData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="volume" stroke="hsl(var(--chart-1))" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Amounts Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={transactionAmountData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrencyCompact(value)} />
                      <Legend />
                      <Bar dataKey="amount" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        isAnimationActive={false}
                        data={transactionTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {transactionTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrencyCompact(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Savings by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={savingsByCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value: number) => formatCurrencyCompact(value)} />
                      <Tooltip formatter={(value: number) => formatCurrencyCompact(value)} />
                      <Legend />
                      <Bar dataKey="amount" fill="hsl(var(--chart-3))" name="Current Savings" />
                      <Bar dataKey="goal_amount" fill="hsl(var(--chart-5))" name="Goal Amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrencyCompact(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deposits vs Withdrawals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={performanceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {performanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrencyCompact(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Insights;
