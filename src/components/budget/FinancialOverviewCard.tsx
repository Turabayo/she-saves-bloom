import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/dateFormatter";

interface FinancialOverviewCardProps {
  plannedIncome: number;
  actualIncome: number;
  plannedBills: number;
  actualBills: number;
  plannedExpenses: number;
  actualExpenses: number;
  plannedDebt: number;
  actualDebt: number;
  plannedSavings: number;
  actualSavings: number;
  currency: string;
}

export const FinancialOverviewCard = ({
  plannedIncome,
  actualIncome,
  plannedBills,
  actualBills,
  plannedExpenses,
  actualExpenses,
  plannedDebt,
  actualDebt,
  plannedSavings,
  actualSavings,
  currency
}: FinancialOverviewCardProps) => {
  const plannedLeft = plannedIncome - plannedBills - plannedExpenses - plannedDebt - plannedSavings;
  const actualLeft = actualIncome - actualBills - actualExpenses - actualDebt - actualSavings;

  const rows = [
    { label: '+ Income', planned: plannedIncome, actual: actualIncome, isPositive: true },
    { label: '- Bills', planned: plannedBills, actual: actualBills },
    { label: '- Expenses', planned: plannedExpenses, actual: actualExpenses },
    { label: '- Debt', planned: plannedDebt, actual: actualDebt },
    { label: '- Savings', planned: plannedSavings, actual: actualSavings },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 border-b border-border pb-3">
        <CardTitle className="text-center text-lg font-semibold tracking-wider text-foreground">
          FINANCIAL OVERVIEW
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr,100px,100px] gap-2 px-4 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
          <div></div>
          <div className="text-right">PLANNED</div>
          <div className="text-right">ACTUAL</div>
        </div>

        {/* Data Rows */}
        {rows.map((row, index) => (
          <div 
            key={row.label} 
            className="grid grid-cols-[1fr,100px,100px] gap-2 px-4 py-2.5 border-b border-border/50 items-center"
          >
            <span className="text-sm text-foreground">{row.label}</span>
            <div className="text-right text-sm text-foreground">
              {formatCurrency(row.planned, currency)}
            </div>
            <div className="text-right text-sm text-foreground">
              {formatCurrency(row.actual, currency)}
            </div>
          </div>
        ))}

        {/* Left Row */}
        <div className="grid grid-cols-[1fr,100px,100px] gap-2 px-4 py-3 bg-muted/50 items-center font-medium">
          <div className="text-sm text-foreground font-semibold">LEFT</div>
          <div className={`text-right text-sm font-semibold ${plannedLeft >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(plannedLeft, currency)}
          </div>
          <div className={`text-right text-sm font-semibold ${actualLeft >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(actualLeft, currency)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
