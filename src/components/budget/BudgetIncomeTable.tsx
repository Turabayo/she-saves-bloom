import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Income } from "@/hooks/useIncome";
import { formatCurrency } from "@/utils/dateFormatter";

interface BudgetIncomeTableProps {
  plannedIncome: number;
  onUpdatePlannedIncome: (amount: number) => Promise<any>;
  incomes: Income[];
  currency: string;
}

export const BudgetIncomeTable = ({ plannedIncome, onUpdatePlannedIncome, incomes, currency }: BudgetIncomeTableProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(plannedIncome.toString());

  // Calculate actual income for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const actualIncome = incomes
    .filter(inc => {
      const d = new Date(inc.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, inc) => sum + inc.amount, 0);

  const difference = actualIncome - plannedIncome;

  const handleSave = async () => {
    await onUpdatePlannedIncome(parseFloat(editValue) || 0);
    setIsEditing(false);
  };

  const startEdit = () => {
    setEditValue(plannedIncome.toString());
    setIsEditing(true);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 border-b border-border">
        <CardTitle className="text-center text-lg font-semibold tracking-wider text-foreground">
          INCOME
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr,120px,120px] gap-2 px-4 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
          <div></div>
          <div className="text-right">PLANNED</div>
          <div className="text-right">ACTUAL</div>
        </div>

        {/* Income Row */}
        <div className="grid grid-cols-[1fr,120px,120px] gap-2 px-4 py-3 border-b border-border/50 items-center">
          <span className="text-sm text-foreground">Total Income</span>
          
          {isEditing ? (
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 text-right text-sm"
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          ) : (
            <div 
              className="text-right text-sm text-foreground cursor-pointer hover:text-primary"
              onClick={startEdit}
            >
              {formatCurrency(plannedIncome, currency)}
            </div>
          )}
          
          <div className="text-right text-sm text-foreground">
            {formatCurrency(actualIncome, currency)}
          </div>
        </div>

        {/* Difference Row */}
        <div className="grid grid-cols-[1fr,120px,120px] gap-2 px-4 py-3 bg-muted/50 items-center font-medium">
          <div className="text-sm text-foreground">Difference</div>
          <div></div>
          <div className={`text-right text-sm ${difference >= 0 ? 'text-success' : 'text-destructive'}`}>
            {difference >= 0 ? '+' : ''}{formatCurrency(difference, currency)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
