import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { ExpensesList } from '@/components/ExpensesList';
import { IncomeList } from '@/components/IncomeList';
import { ExpenseInsights } from '@/components/ExpenseInsights';
import { IncomeInsights } from '@/components/IncomeInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';

const Expenses: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("income");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="py-6">
            <h1 className="text-3xl font-bold tracking-tight">{t('incomeExpenseTracker')}</h1>
            <p className="text-muted-foreground">Track and analyze your income and spending habits</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">{t('expenses')}</TabsTrigger>
              <TabsTrigger value="insights">{t('insights')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="income">
              <IncomeList onIncomeAdded={() => setActiveTab("income")} />
            </TabsContent>
            
            <TabsContent value="expenses">
              <ExpensesList onExpenseAdded={() => setActiveTab("expenses")} />
            </TabsContent>
            
            <TabsContent value="insights">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpenseInsights />
                <IncomeInsights />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Expenses;