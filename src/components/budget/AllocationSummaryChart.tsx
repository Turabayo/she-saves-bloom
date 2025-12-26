import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/dateFormatter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AllocationSummaryChartProps {
  bills: number;
  expenses: number;
  debt: number;
  savings: number;
  currency: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

export const AllocationSummaryChart = ({ bills, expenses, debt, savings, currency }: AllocationSummaryChartProps) => {
  const total = bills + expenses + debt + savings;

  const chartData = [
    { name: 'Bills', value: bills, color: COLORS[0] },
    { name: 'Expenses', value: expenses, color: COLORS[1] },
    { name: 'Debt', value: debt, color: COLORS[2] },
    { name: 'Savings', value: savings, color: COLORS[3] },
  ].filter(item => item.value > 0);

  const getPercentage = (value: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value, currency)} ({getPercentage(data.value)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 border-b border-border pb-3">
        <CardTitle className="text-center text-lg font-semibold tracking-wider text-foreground">
          ALLOCATION SUMMARY
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {total === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground">
            No allocations yet
          </div>
        ) : (
          <>
            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-foreground truncate">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {getPercentage(item.value)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
