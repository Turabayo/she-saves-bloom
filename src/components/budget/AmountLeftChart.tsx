import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/dateFormatter";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AmountLeftChartProps {
  income: number;
  bills: number;
  expenses: number;
  debt: number;
  savings: number;
  currency: string;
}

export const AmountLeftChart = ({ income, bills, expenses, debt, savings, currency }: AmountLeftChartProps) => {
  const totalAllocated = bills + expenses + debt + savings;
  const amountLeft = Math.max(income - totalAllocated, 0);
  const percentageUsed = income > 0 ? (totalAllocated / income) * 100 : 0;
  const percentageLeft = 100 - Math.min(percentageUsed, 100);

  const chartData = [
    { name: 'Used', value: Math.min(percentageUsed, 100), color: 'hsl(var(--primary))' },
    { name: 'Left', value: Math.max(percentageLeft, 0), color: 'hsl(var(--muted))' },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 border-b border-border pb-3">
        <CardTitle className="text-center text-lg font-semibold tracking-wider text-foreground">
          AMOUNT LEFT TO SPEND
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative w-full max-w-[240px] mx-auto aspect-square">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="90%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">
              {formatCurrency(amountLeft, currency)}
            </span>
            {income > 0 && (
              <span className="text-sm text-muted-foreground mt-1">
                {percentageLeft.toFixed(0)}% remaining
              </span>
            )}
          </div>
        </div>

        {/* Summary below chart */}
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Income</span>
            <span className="text-foreground font-medium">{formatCurrency(income, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Allocated</span>
            <span className="text-foreground font-medium">{formatCurrency(totalAllocated, currency)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="font-medium text-foreground">Left to Spend</span>
            <span className={`font-bold ${amountLeft > 0 ? 'text-success' : 'text-muted-foreground'}`}>
              {formatCurrency(amountLeft, currency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
