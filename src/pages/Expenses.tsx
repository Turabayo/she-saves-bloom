import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
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
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navigation />
          <main className="flex-1 container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">{t('incomeExpenseTracker')}</h1>
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Expenses;
