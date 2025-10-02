import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useExpenses } from '@/hooks/useExpenses';
import { TrendingUp, Calendar } from 'lucide-react';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const ExpenseInsights: React.FC = () => {
  const { expenses } = useExpenses();

  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const monthlyData = useMemo(() => {
    const currentMonthExpenses = expenses.filter(expense => 
      expense.date.startsWith(currentMonth)
    );
    
    const totalThisMonth = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: ((amount / totalThisMonth) * 100).toFixed(1)
    }));

    return {
      totalThisMonth,
      categoryData
    };
  }, [expenses, currentMonth]);

  const last6MonthsData = useMemo(() => {
    const monthsData: Record<string, number> = {};
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const monthExpenses = expenses.filter(expense => expense.date.startsWith(monthKey));
      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      monthsData[monthName] = total;
    }

    return Object.entries(monthsData).map(([month, amount]) => ({
      month,
      amount
    }));
  }, [expenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            This Month's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-white">
              {formatCurrency(monthlyData.totalThisMonth)}
            </div>
            <p className="text-sm text-muted-foreground">Total expenses this month</p>
          </div>
          
          {monthlyData.categoryData.length > 0 && (
            <div className="space-y-2">
              {monthlyData.categoryData.map((item, index) => (
                <div key={item.category} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-white">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{formatCurrency(item.amount)}</div>
                    <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={monthlyData.categoryData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {monthlyData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No expenses this month to display
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6-Month Trend */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-white">6-Month Expense Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {last6MonthsData.some(d => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={last6MonthsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                <Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No expense data to display trend
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};