import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Check } from "lucide-react";
import { BudgetBill } from "@/hooks/useBudgetBills";
import { formatCurrency } from "@/utils/dateFormatter";

interface BudgetBillsTableProps {
  bills: BudgetBill[];
  onAdd: (name: string, planned: number) => Promise<any>;
  onUpdate: (id: string, updates: Partial<Pick<BudgetBill, 'name' | 'planned_amount' | 'actual_amount' | 'is_paid'>>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  currency: string;
}

export const BudgetBillsTable = ({ bills, onAdd, onUpdate, onDelete, currency }: BudgetBillsTableProps) => {
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

  const startEdit = (bill: BudgetBill) => {
    setEditingId(bill.id);
    setEditValues({
      planned: bill.planned_amount.toString(),
      actual: bill.actual_amount.toString()
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

  const totalPlanned = bills.reduce((sum, b) => sum + b.planned_amount, 0);
  const totalActual = bills.reduce((sum, b) => sum + b.actual_amount, 0);
  const totalProgress = getProgress(totalPlanned, totalActual);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 border-b border-border">
        <CardTitle className="text-center text-lg font-semibold tracking-wider text-foreground">
          BILLS
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

        {/* Bill Rows */}
        {bills.map((bill) => {
          const progress = getProgress(bill.planned_amount, bill.actual_amount);
          const isEditing = editingId === bill.id;

          return (
            <div key={bill.id} className="grid grid-cols-[1fr,100px,100px,80px,40px] gap-2 px-4 py-2 border-b border-border/50 items-center hover:bg-muted/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdate(bill.id, { is_paid: !bill.is_paid })}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    bill.is_paid ? 'bg-primary border-primary' : 'border-border hover:border-primary'
                  }`}
                >
                  {bill.is_paid && <Check size={12} className="text-primary-foreground" />}
                </button>
                <span className="text-sm text-foreground truncate">{bill.name}</span>
              </div>
              
              {isEditing ? (
                <>
                  <Input
                    type="number"
                    value={editValues.planned}
                    onChange={(e) => setEditValues(prev => ({ ...prev, planned: e.target.value }))}
                    className="h-7 text-right text-sm"
                    onBlur={() => saveEdit(bill.id)}
                  />
                  <Input
                    type="number"
                    value={editValues.actual}
                    onChange={(e) => setEditValues(prev => ({ ...prev, actual: e.target.value }))}
                    className="h-7 text-right text-sm"
                    onBlur={() => saveEdit(bill.id)}
                  />
                </>
              ) : (
                <>
                  <div 
                    className="text-right text-sm text-foreground cursor-pointer hover:text-primary"
                    onClick={() => startEdit(bill)}
                  >
                    {formatCurrency(bill.planned_amount, currency)}
                  </div>
                  <div 
                    className="text-right text-sm text-foreground cursor-pointer hover:text-primary"
                    onClick={() => startEdit(bill)}
                  >
                    {formatCurrency(bill.actual_amount, currency)}
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
                onClick={() => onDelete(bill.id)}
              >
                <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          );
        })}

        {/* Add Row */}
        <div className="grid grid-cols-[1fr,100px,100px,80px,40px] gap-2 px-4 py-2 border-b border-border/50 items-center">
          <Input
            placeholder="Add bill..."
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
