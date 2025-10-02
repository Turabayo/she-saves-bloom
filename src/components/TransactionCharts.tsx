import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useChartData } from "@/hooks/useChartData";
import { Loader2 } from "lucide-react";

export const TransactionCharts = () => {
  const { dailyVolumeData, transactionAmountData, transactionTypeData, isLoading } = useChartData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Financial Dashboard</h1>
        <p className="text-muted-foreground">Real-time analytics and insights</p>
      </div>

      {/* Daily Transaction Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Transaction Volume</CardTitle>
          <p className="text-sm text-muted-foreground">Transactions Over Time</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300} className="md:h-96">
            <LineChart data={dailyVolumeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="topups" 
                stroke="#8B5CF6" 
                strokeWidth={2} 
                name="Top-ups"
              />
              <Line 
                type="monotone" 
                dataKey="withdrawals" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                name="Withdrawals"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Transaction Amount */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Transaction Amount</CardTitle>
          <p className="text-sm text-muted-foreground">Transaction Amount Over Time</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280} className="md:h-80">
            <BarChart data={transactionAmountData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
                formatter={(value) => [`RWF ${Number(value).toLocaleString()}`, 'Amount']}
              />
              <Bar dataKey="amount" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transaction Types Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Types</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution by Category</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300} className="md:h-96">
            <PieChart>
              <Pie
                data={transactionTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {transactionTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};