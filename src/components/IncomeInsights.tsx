import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useIncome } from '@/hooks/useIncome';
import { useExpenses } from '@/hooks/useExpenses';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export const IncomeInsights = () => {
  const { income } = useIncome();
  const { expenses } = useExpenses();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Monthly income summary
  const monthlyData = useMemo(() => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const currentMonthIncome = income.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= monthStart && itemDate <= monthEnd;
    });

    const totalIncome = currentMonthIncome.reduce((sum, item) => sum + Number(item.amount), 0);

    // Group by source
    const bySource = currentMonthIncome.reduce((acc, item) => {
      const source = item.source || 'Other';
      acc[source] = (acc[source] || 0) + Number(item.amount);
      return acc;
    }, {} as Record<string, number>);

    const sourceBreakdown = Object.entries(bySource).map(([source, amount]) => ({
      source,
      amount,
      percentage: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0
    }));

    return { totalIncome, sourceBreakdown };
  }, [income]);

  // 6-month income trend
  const last6MonthsIncomeData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthIncome = income.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= monthStart && itemDate <= monthEnd;
      });

      const total = monthIncome.reduce((sum, item) => sum + Number(item.amount), 0);
      
      months.push({
        month: format(date, 'MMM yyyy'),
        income: total
      });
    }
    return months;
  }, [income]);

  // Income vs Expenses comparison
  const incomeVsExpenses = useMemo(() => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const currentMonthIncome = income.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= monthStart && itemDate <= monthEnd;
    }).reduce((sum, item) => sum + Number(item.amount), 0);

    const currentMonthExpenses = expenses.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= monthStart && itemDate <= monthEnd;
    }).reduce((sum, item) => sum + Number(item.amount), 0);

    return [
      { name: 'Income', amount: currentMonthIncome, color: 'hsl(var(--primary))' },
      { name: 'Expenses', amount: currentMonthExpenses, color: 'hsl(var(--secondary))' }
    ];
  }, [income, expenses]);

  const pieChartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="grid gap-6">
      {/* This Month's Income Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">This Month's Income Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-4">
            {formatCurrency(monthlyData.totalIncome)}
          </div>
          
          {monthlyData.sourceBreakdown.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Breakdown by Source:</h4>
              {monthlyData.sourceBreakdown.map((item, index) => (
                <div key={item.source} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: pieChartColors[index % pieChartColors.length] }}
                    />
                    <span className="text-sm text-white">{item.source}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">{formatCurrency(item.amount)}</div>
                    <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No income recorded this month</p>
          )}
        </CardContent>
      </Card>

      {/* Source Breakdown Pie Chart */}
      {monthlyData.sourceBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Income by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={monthlyData.sourceBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="amount"
                  label={({ percentage }) => `${percentage}%`}
                >
                  {monthlyData.sourceBreakdown.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={pieChartColors[index % pieChartColors.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 6-Month Income Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">6-Month Income Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last6MonthsIncomeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Income']} />
              <Bar dataKey="income" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Income vs Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">This Month: Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeVsExpenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
              <Legend />
              <Bar dataKey="amount">
                {incomeVsExpenses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Net Income:</span>
              <span className={`font-bold ${incomeVsExpenses[0].amount - incomeVsExpenses[1].amount >= 0 ? 'text-white' : 'text-slate-400'}`}>
                {formatCurrency(incomeVsExpenses[0].amount - incomeVsExpenses[1].amount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};