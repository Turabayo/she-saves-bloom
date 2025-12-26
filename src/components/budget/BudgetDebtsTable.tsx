import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { BudgetDebt } from "@/hooks/useBudgetDebts";
import { formatCurrency } from "@/utils/dateFormatter";

interface BudgetDebtsTableProps {
  debts: BudgetDebt[];
  onAdd: (name: string, planned: number) => Promise<any>;
  onUpdate: (id: string, updates: Partial<Pick<BudgetDebt, 'name' | 'planned_amount' | 'actual_amount'>>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  currency: string;
}

export const BudgetDebtsTable = ({ debts, onAdd, onUpdate, onDelete, currency }: BudgetDebtsTableProps) => {
  const [newName, setNewName] = useState('');
  const [newPlanned, setNewPlanned] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ planned: string; actual: string }>({ planned: '', actual: '' });

  const handleAdd = async () => {
    if (!newName.trim() || !newPlanned) return;
    await onAdd(newName.trim(), parseFloat(newPlanned));
    setNewName('');
    setNewPlanned('');
  };

  const startEdit = (debt: BudgetDebt) => {
    setEditingId(debt.id);
    setEditValues({
      planned: debt.planned_amount.toString(),
      actual: debt.actual_amount.toString()
    });
  };

  const saveEdit = async (id: string) => {
    await onUpdate(id, {
      planned_amount: parseFloat(editValues.planned) || 0,
      actual_amount: parseFloat(editValues.actual) || 0
    });
    setEditingId(null);
  };

  const getProgress = (planned: number, actual: number) => {
    if (planned === 0) return 0;
    return Math.min((actual / planned) * 100, 100);
  };

  const totalPlanned = debts.reduce((sum, d) => sum + d.planned_amount, 0);
  const totalActual = debts.reduce((sum, d) => sum + d.actual_amount, 0);
  const totalProgress = getProgress(totalPlanned, totalActual);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 border-b border-border">
        <CardTitle className="text-center text-lg font-semibold tracking-wider text-foreground">
          DEBT
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr,100px,100px,80px,40px] gap-2 px-4 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
          <div></div>
          <div className="text-right">PLANNED</div>
          <div className="text-right">ACTUAL</div>
          <div className="text-right">PROGRESS</div>
          <div></div>
        </div>

        {/* Debt Rows */}
        {debts.map((debt) => {
          const progress = getProgress(debt.planned_amount, debt.actual_amount);
          const isEditing = editingId === debt.id;

          return (
            <div key={debt.id} className="grid grid-cols-[1fr,100px,100px,80px,40px] gap-2 px-4 py-2 border-b border-border/50 items-center hover:bg-muted/30">
              <span className="text-sm text-foreground truncate">{debt.name}</span>
              
              {isEditing ? (
                <>
                  <Input
                    type="number"
                    value={editValues.planned}
                    onChange={(e) => setEditValues(prev => ({ ...prev, planned: e.target.value }))}
                    className="h-7 text-right text-sm"
                    onBlur={() => saveEdit(debt.id)}
                  />
                  <Input
                    type="number"
                    value={editValues.actual}
                    onChange={(e) => setEditValues(prev => ({ ...prev, actual: e.target.value }))}
                    className="h-7 text-right text-sm"
                    onBlur={() => saveEdit(debt.id)}
                  />
                </>
              ) : (
                <>
                  <div 
                    className="text-right text-sm text-foreground cursor-pointer hover:text-primary"
                    onClick={() => startEdit(debt)}
                  >
                    {formatCurrency(debt.planned_amount, currency)}
                  </div>
                  <div 
                    className="text-right text-sm text-foreground cursor-pointer hover:text-primary"
                    onClick={() => startEdit(debt)}
                  >
                    {formatCurrency(debt.actual_amount, currency)}
                  </div>
                </>
              )}
              
              <div className="text-right text-xs text-muted-foreground">
                {progress.toFixed(0)}%
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onDelete(debt.id)}
              >
                <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          );
        })}

        {/* Add Row */}
        <div className="grid grid-cols-[1fr,100px,100px,80px,40px] gap-2 px-4 py-2 border-b border-border/50 items-center">
          <Input
            placeholder="Add debt..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-sm"
          />
          <Input
            type="number"
            placeholder="0"
            value={newPlanned}
            onChange={(e) => setNewPlanned(e.target.value)}
            className="h-8 text-right text-sm"
          />
          <div className="text-right text-sm text-muted-foreground">-</div>
          <div className="text-right text-sm text-muted-foreground">-</div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleAdd}
            disabled={!newName.trim() || !newPlanned}
          >
            <Plus size={14} className="text-primary" />
          </Button>
        </div>

        {/* Total Row */}
        <div className="grid grid-cols-[1fr,100px,100px,80px,40px] gap-2 px-4 py-3 bg-muted/50 items-center font-medium">
          <div className="text-sm text-foreground">TOTAL</div>
          <div className="text-right text-sm text-foreground">{formatCurrency(totalPlanned, currency)}</div>
          <div className="text-right text-sm text-foreground">{formatCurrency(totalActual, currency)}</div>
          <div className="text-right text-xs text-foreground">{totalProgress.toFixed(0)}%</div>
          <div></div>
        </div>
      </CardContent>
    </Card>
  );
};
