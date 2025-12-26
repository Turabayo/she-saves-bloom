import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check } from "lucide-react";
import { BudgetPlannedSaving } from "@/hooks/useBudgetPlannedSavings";
import { formatCurrency } from "@/utils/dateFormatter";

interface BudgetSavingsTableProps {
  plannedSavings: BudgetPlannedSaving[];
  actualSavings: number; // Total actual savings from savings table
  savingsByGoal: Map<string, number>; // Actual savings grouped by goal
  onAdd: (name: string, planned: number, goalId?: string) => Promise<any>;
  onUpdate: (id: string, updates: Partial<Pick<BudgetPlannedSaving, 'name' | 'planned_amount' | 'goal_id'>>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  currency: string;
}

export const BudgetSavingsTable = ({ 
  plannedSavings, 
  actualSavings, 
  savingsByGoal,
  onAdd, 
  onUpdate, 
  onDelete, 
  currency 
}: BudgetSavingsTableProps) => {
  const [newName, setNewName] = useState('');
  const [newPlanned, setNewPlanned] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = async () => {
    if (!newName.trim() || !newPlanned) return;
    await onAdd(newName.trim(), parseFloat(newPlanned));
    setNewName('');
    setNewPlanned('');
  };

  const startEdit = (saving: BudgetPlannedSaving) => {
    setEditingId(saving.id);
    setEditValue(saving.planned_amount.toString());
  };

  const saveEdit = async (id: string) => {
    await onUpdate(id, {
      planned_amount: parseFloat(editValue) || 0
    });
    setEditingId(null);
  };

  const getActualForSaving = (saving: BudgetPlannedSaving) => {
    if (saving.goal_id) {
      return savingsByGoal.get(saving.goal_id) || 0;
    }
    return 0;
  };

  const getProgress = (planned: number, actual: number) => {
    if (planned === 0) return 0;
    return Math.min((actual / planned) * 100, 100);
  };

  const totalPlanned = plannedSavings.reduce((sum, s) => sum + s.planned_amount, 0);
  const totalProgress = getProgress(totalPlanned, actualSavings);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 border-b border-border">
        <CardTitle className="text-center text-lg font-semibold tracking-wider text-foreground">
          SAVINGS
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

        {/* Savings Rows */}
        {plannedSavings.map((saving) => {
          const actual = getActualForSaving(saving);
          const progress = getProgress(saving.planned_amount, actual);
          const isEditing = editingId === saving.id;

          return (
            <div key={saving.id} className="grid grid-cols-[1fr,100px,100px,80px,40px] gap-2 px-4 py-2 border-b border-border/50 items-center hover:bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border border-primary/30 flex items-center justify-center">
                  <Check size={12} className="text-primary" />
                </div>
                <span className="text-sm text-foreground truncate">{saving.name}</span>
              </div>
              
              {isEditing ? (
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-7 text-right text-sm"
                  onBlur={() => saveEdit(saving.id)}
                  autoFocus
                />
              ) : (
                <div 
                  className="text-right text-sm text-foreground cursor-pointer hover:text-primary"
                  onClick={() => startEdit(saving)}
                >
                  {formatCurrency(saving.planned_amount, currency)}
                </div>
              )}
              
              <div className="text-right text-sm text-foreground">
                {formatCurrency(actual, currency)}
              </div>
              
              <div className="text-right text-xs text-muted-foreground">
                {progress.toFixed(0)}%
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onDelete(saving.id)}
              >
                <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          );
        })}

        {/* Add Row */}
        <div className="grid grid-cols-[1fr,100px,100px,80px,40px] gap-2 px-4 py-2 border-b border-border/50 items-center">
          <Input
            placeholder="Add savings goal..."
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
          <div className="text-right text-sm text-foreground">{formatCurrency(actualSavings, currency)}</div>
          <div className="text-right text-xs text-foreground">{totalProgress.toFixed(0)}%</div>
          <div></div>
        </div>
      </CardContent>
    </Card>
  );
};
