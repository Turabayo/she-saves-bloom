import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/dateFormatter";
import { TrendingUp, TrendingDown, Target, Wallet } from "lucide-react";

interface BudgetSummaryCardProps {
  income: number;
  totalAllocated: number;
  savingsRate: number;
  amountLeft: number;
  currency: string;
}

export const BudgetSummaryCard = ({ 
  income, 
  totalAllocated, 
  savingsRate, 
  amountLeft, 
  currency 
}: BudgetSummaryCardProps) => {
  const isHealthy = amountLeft >= 0 && savingsRate >= 20;
  const isWarning = amountLeft >= 0 && savingsRate < 20 && savingsRate >= 10;
  const isDanger = amountLeft < 0 || savingsRate < 10;

  const getHealthLabel = () => {
    if (isDanger) return { text: 'Needs Attention', color: 'text-destructive', bg: 'bg-destructive/10' };
    if (isWarning) return { text: 'On Track', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { text: 'Excellent', color: 'text-success', bg: 'bg-success/10' };
  };

  const health = getHealthLabel();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 border-b border-border pb-3">
        <CardTitle className="text-center text-lg font-semibold tracking-wider text-foreground">
          MONTHLY SUMMARY
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Health Indicator */}
        <div className={`${health.bg} rounded-lg p-4 mb-6 text-center`}>
          <span className={`text-lg font-semibold ${health.color}`}>
            Budget Health: {health.text}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground font-medium">TOTAL INCOME</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(income, currency)}
            </span>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground font-medium">ALLOCATED</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(totalAllocated, currency)}
            </span>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground font-medium">SAVINGS RATE</span>
            </div>
            <span className={`text-xl font-bold ${savingsRate >= 20 ? 'text-success' : savingsRate >= 10 ? 'text-yellow-500' : 'text-destructive'}`}>
              {savingsRate.toFixed(1)}%
            </span>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground font-medium">REMAINING</span>
            </div>
            <span className={`text-xl font-bold ${amountLeft >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(amountLeft, currency)}
            </span>
          </div>
        </div>

        {/* Smart Feedback */}
        <div className="mt-6 space-y-2">
          {savingsRate >= 20 && (
            <div className="text-sm text-success bg-success/10 rounded-lg p-3">
              Great job! You're saving {savingsRate.toFixed(0)}% of your income.
            </div>
          )}
          {savingsRate > 0 && savingsRate < 20 && (
            <div className="text-sm text-yellow-500 bg-yellow-500/10 rounded-lg p-3">
              Consider increasing your savings rate to at least 20%.
            </div>
          )}
          {amountLeft < 0 && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
              Your allocations exceed your income by {formatCurrency(Math.abs(amountLeft), currency)}.
            </div>
          )}
          {amountLeft > 0 && income > 0 && (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              You have {formatCurrency(amountLeft, currency)} available to allocate or spend.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
