import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Filter, Plus } from 'lucide-react';
import { useExpenses, Expense } from '@/hooks/useExpenses';
import { AddExpenseDialog } from './AddExpenseDialog';
import { format } from 'date-fns';

const EXPENSE_CATEGORIES = ['All', 'Food', 'Transport', 'Rent', 'Health', 'School', 'Other'];

interface ExpensesListProps {
  onExpenseAdded?: () => void;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({ onExpenseAdded }) => {
  const { expenses, loading, deleteExpense } = useExpenses();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;
    const matchesDate = !dateFilter || expense.date.startsWith(dateFilter);
    return matchesCategory && matchesDate;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food': 'bg-secondary/10 text-secondary',
      'Transport': 'bg-blue-100 text-blue-800',
      'Rent': 'bg-purple-100 text-purple-800',
      'Health': 'bg-emerald-500/10 text-emerald-400',
      'School': 'bg-amber-500/10 text-amber-400',
      'Other': 'bg-slate-500/10 text-slate-400',
    };
    return colors[category] || colors['Other'];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading expenses...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Expenses History
        </CardTitle>
        
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-40"
            placeholder="Filter by month"
          />
          
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {expenses.length === 0 ? 'No expenses recorded yet.' : 'No expenses match your filters.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Badge className={getCategoryColor(expense.category)}>
                      {expense.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <div className="font-semibold text-lg">
                    {formatCurrency(expense.amount)}
                  </div>
                  
                  {expense.note && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {expense.note}
                    </p>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteExpense(expense.id)}
                  className="ml-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AddExpenseDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSuccess={onExpenseAdded}
      />
    </Card>
  );
};