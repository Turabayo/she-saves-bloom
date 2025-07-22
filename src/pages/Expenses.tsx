import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';
import { ExpensesList } from '@/components/ExpensesList';
import { IncomeList } from '@/components/IncomeList';
import { ExpenseInsights } from '@/components/ExpenseInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';

const Expenses: React.FC = () => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('incomeExpenseTracker')}</h1>
          <p className="text-muted-foreground">Track and analyze your income and spending habits</p>
        </div>
        
        <Button onClick={() => setShowAddExpense(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <Tabs defaultValue="income" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income">{t('income')}</TabsTrigger>
          <TabsTrigger value="expenses">{t('expenses')}</TabsTrigger>
          <TabsTrigger value="insights">{t('insights')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income">
          <IncomeList />
        </TabsContent>
        
        <TabsContent value="expenses">
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