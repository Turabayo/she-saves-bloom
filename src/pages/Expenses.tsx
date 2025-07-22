import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';
import { ExpensesList } from '@/components/ExpensesList';
import { ExpenseInsights } from '@/components/ExpenseInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Expenses: React.FC = () => {
  const [showAddExpense, setShowAddExpense] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
          <p className="text-muted-foreground">Track and analyze your spending habits</p>
        </div>
        
        <Button onClick={() => setShowAddExpense(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Expenses List</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <ExpensesList />
        </TabsContent>
        
        <TabsContent value="insights">
          <ExpenseInsights />
        </TabsContent>
      </Tabs>

      <AddExpenseDialog 
        open={showAddExpense} 
        onOpenChange={setShowAddExpense} 
      />
    </div>
  );
};

export default Expenses;