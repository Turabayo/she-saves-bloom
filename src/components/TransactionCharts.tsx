import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock data for transaction charts based on the categories from the user's request
const dailyVolumeData = [
  { date: "Jan 2024", incoming: 12, payment_code: 8, bank_deposit: 5, mobile_transfer: 15, airtime: 3, third_party: 6, cash_power: 2, withdrawal: 4, bank_transfer: 7 },
  { date: "Feb 2024", incoming: 15, payment_code: 12, bank_deposit: 8, mobile_transfer: 18, airtime: 5, third_party: 9, cash_power: 3, withdrawal: 6, bank_transfer: 10 },
  { date: "Mar 2024", incoming: 18, payment_code: 15, bank_deposit: 12, mobile_transfer: 22, airtime: 7, third_party: 12, cash_power: 5, withdrawal: 8, bank_transfer: 13 },
  { date: "Apr 2024", incoming: 22, payment_code: 18, bank_deposit: 15, mobile_transfer: 25, airtime: 9, third_party: 15, cash_power: 7, withdrawal: 10, bank_transfer: 16 },
  { date: "May 2024", incoming: 25, payment_code: 20, bank_deposit: 18, mobile_transfer: 28, airtime: 11, third_party: 18, cash_power: 9, withdrawal: 12, bank_transfer: 19 },
];

const transactionAmountData = [
  { month: "Jan", amount: 850000 },
  { month: "Feb", amount: 920000 },
  { month: "Mar", amount: 1150000 },
  { month: "Apr", amount: 1350000 },
  { month: "May", amount: 1480000 },
  { month: "Jun", amount: 1620000 },
];

const transactionTypeData = [
  { name: "Incoming", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Payment Code", value: 22, color: "hsl(var(--chart-2))" },
  { name: "Mobile Transfer", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Bank Deposit", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Withdrawal", value: 8, color: "hsl(var(--chart-5))" },
  { name: "Third Party", value: 5, color: "hsl(var(--chart-6))" },
];

const agentPerformanceData = [
  { name: "Agent A", withdrawals: 45, deposits: 38 },
  { name: "Agent B", withdrawals: 32, deposits: 45 },
  { name: "Agent C", withdrawals: 28, deposits: 35 },
  { name: "Agent D", withdrawals: 22, deposits: 28 },
];

export const TransactionCharts = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Mobile Money Transaction Dashboard</h1>
        <p className="text-muted-foreground">Real-time analytics and insights</p>
      </div>

      {/* Daily Transaction Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Transaction Volume</CardTitle>
          <p className="text-sm text-muted-foreground">Transactions Over Time</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
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
              <Line type="monotone" dataKey="incoming" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Incoming" />
              <Line type="monotone" dataKey="payment_code" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Payment Code" />
              <Line type="monotone" dataKey="mobile_transfer" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Mobile Transfer" />
              <Line type="monotone" dataKey="bank_deposit" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Bank Deposit" />
              <Line type="monotone" dataKey="withdrawal" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Withdrawal" />
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
          <ResponsiveContainer width="100%" height={350}>
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
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Types Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Types</CardTitle>
            <p className="text-sm text-muted-foreground">Distribution by Category</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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

        {/* Agent Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Agents by Performance</CardTitle>
            <p className="text-sm text-muted-foreground">Agent Performance Metrics</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentPerformanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="withdrawals" fill="hsl(var(--chart-1))" name="Withdrawals" />
                <Bar dataKey="deposits" fill="hsl(var(--chart-2))" name="Deposits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};