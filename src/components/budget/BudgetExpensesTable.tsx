import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/hooks/useExpenses";
import { formatCurrency } from "@/utils/dateFormatter";

interface BudgetExpensesTableProps {
  expenses: Expense[];
  budgets: Array<{ category: string; amount: number }>;
  currency: string;
}

export const BudgetExpensesTable = ({ expenses, budgets, currency }: BudgetExpensesTableProps) => {
  // Group expenses by category for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const expensesByCategory = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  // Create rows: use budgets for planned, expenses for actual
  const categories = Array.from(new Set([
    ...budgets.map(b => b.category),
    ...Object.keys(expensesByCategory)
  ]));

  const rows = categories.map(category => {
    const budget = budgets.find(b => b.category === category);
    const planned = budget?.amount || 0;
    const actual = expensesByCategory[category] || 0;
    const progress = planned > 0 ? Math.min((actual / planned) * 100, 100) : 0;
    return { category, planned, actual, progress };
  });

  const totalPlanned = rows.reduce((sum, r) => sum + r.planned, 0);
  const totalActual = rows.reduce((sum, r) => sum + r.actual, 0);
  const totalProgress = totalPlanned > 0 ? Math.min((totalActual / totalPlanned) * 100, 100) : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 border-b border-border">
        <CardTitle className="text-center text-lg font-semibold tracking-wider text-foreground">
          EXPENSES
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr,100px,100px,80px] gap-2 px-4 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
          <div></div>
          <div className="text-right">PLANNED</div>
          <div className="text-right">ACTUAL</div>
          <div className="text-right">PROGRESS</div>
        </div>

        {/* Expense Rows */}
        {rows.length === 0 ? (
          <div className="px-4 py-6 text-center text-muted-foreground text-sm">
            No expenses tracked this month. Add budgets and expenses to see them here.
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.category} className="grid grid-cols-[1fr,100px,100px,80px] gap-2 px-4 py-2 border-b border-border/50 items-center hover:bg-muted/30">
              <span className="text-sm text-foreground truncate">{row.category}</span>
              <div className="text-right text-sm text-foreground">
                {formatCurrency(row.planned, currency)}
              </div>
              <div className="text-right text-sm text-foreground">
                {formatCurrency(row.actual, currency)}
              </div>
              <div className={`text-right text-xs ${row.progress > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {row.progress.toFixed(0)}%
              </div>
            </div>
          ))
        )}

        {/* Total Row */}
        {rows.length > 0 && (
          <div className="grid grid-cols-[1fr,100px,100px,80px] gap-2 px-4 py-3 bg-muted/50 items-center font-medium">
            <div className="text-sm text-foreground">TOTAL</div>
            <div className="text-right text-sm text-foreground">{formatCurrency(totalPlanned, currency)}</div>
            <div className="text-right text-sm text-foreground">{formatCurrency(totalActual, currency)}</div>
            <div className={`text-right text-xs ${totalProgress > 100 ? 'text-destructive' : 'text-foreground'}`}>
              {totalProgress.toFixed(0)}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
