import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarSpacer } from "@/components/ui/sidebar";
import Navigation from "@/components/Navigation";
import { useBudgetPeriod } from "@/hooks/useBudgetPeriod";
import { useBudgetBills } from "@/hooks/useBudgetBills";
import { useBudgetDebts } from "@/hooks/useBudgetDebts";
import { useBudgetPlannedSavings } from "@/hooks/useBudgetPlannedSavings";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncome } from "@/hooks/useIncome";
import { useBudget } from "@/hooks/useBudget";
import { useSavings } from "@/hooks/useSavings";
import { BudgetPeriodSelector } from "@/components/budget/BudgetPeriodSelector";
import { BudgetIncomeTable } from "@/components/budget/BudgetIncomeTable";
import { BudgetBillsTable } from "@/components/budget/BudgetBillsTable";
import { BudgetExpensesTable } from "@/components/budget/BudgetExpensesTable";
import { BudgetDebtsTable } from "@/components/budget/BudgetDebtsTable";
import { BudgetSavingsTable } from "@/components/budget/BudgetSavingsTable";
import { AmountLeftChart } from "@/components/budget/AmountLeftChart";
import { AllocationSummaryChart } from "@/components/budget/AllocationSummaryChart";
import { FinancialOverviewCard } from "@/components/budget/FinancialOverviewCard";
import { BudgetSummaryCard } from "@/components/budget/BudgetSummaryCard";
import { Loader } from "@/components/ui/loader";
import FloatingAIButton from "@/components/FloatingAIButton";

const Budget = () => {
  const { user } = useAuth();
  const { budgetPeriod, loading: periodLoading, updatePlannedIncome, updateCurrency, switchPeriod } = useBudgetPeriod();
  const { bills, addBill, updateBill, deleteBill, getTotalPlanned: getBillsPlanned, getTotalActual: getBillsActual } = useBudgetBills(budgetPeriod?.id || null);
  const { debts, addDebt, updateDebt, deleteDebt, getTotalPlanned: getDebtsPlanned, getTotalActual: getDebtsActual } = useBudgetDebts(budgetPeriod?.id || null);
  const { plannedSavings, addPlannedSaving, updatePlannedSaving, deletePlannedSaving, getTotalPlanned: getSavingsPlanned } = useBudgetPlannedSavings(budgetPeriod?.id || null);
  const { expenses } = useExpenses();
  const { income } = useIncome();
  const { budgets } = useBudget();
  const { savings } = useSavings();

  if (!user) return null;

  if (periodLoading) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <SidebarSpacer />
          <div className="flex-1 flex items-center justify-center">
            <Loader size="lg" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const currency = budgetPeriod?.currency || 'RWF';
  const month = budgetPeriod?.month || new Date().getMonth() + 1;
  const year = budgetPeriod?.year || new Date().getFullYear();
  const plannedIncome = budgetPeriod?.planned_income || 0;

  // Calculate actual income for current period
  const currentMonthIncomes = income.filter(inc => {
    const d = new Date(inc.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
  const actualIncome = currentMonthIncomes.reduce((sum, inc) => sum + inc.amount, 0);

  // Calculate actual expenses for current period
  const currentMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
  const actualExpenses = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const plannedExpenses = budgets.reduce((sum, b) => sum + b.amount, 0);

  // Calculate actual savings for current period
  const currentMonthSavings = savings.filter(sav => {
    const d = new Date(sav.created_at || '');
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
  const actualSavings = currentMonthSavings.reduce((sum, sav) => sum + sav.amount, 0);

  // Group savings by goal for the savings table
  const savingsByGoal = new Map<string, number>();
  currentMonthSavings.forEach(sav => {
    if (sav.goal_id) {
      const current = savingsByGoal.get(sav.goal_id) || 0;
      savingsByGoal.set(sav.goal_id, current + sav.amount);
    }
  });

  const billsPlanned = getBillsPlanned();
  const billsActual = getBillsActual();
  const debtsPlanned = getDebtsPlanned();
  const debtsActual = getDebtsActual();
  const savingsPlanned = getSavingsPlanned();

  const totalAllocated = billsActual + actualExpenses + debtsActual + actualSavings;
  const amountLeft = actualIncome - totalAllocated;
  const savingsRate = actualIncome > 0 ? (actualSavings / actualIncome) * 100 : 0;

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarSpacer />
        <div className="flex-1 flex flex-col min-w-0">
          <Navigation />
          <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <BudgetPeriodSelector
              month={month}
              year={year}
              currency={currency}
              onMonthChange={switchPeriod}
              onCurrencyChange={updateCurrency}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <FinancialOverviewCard
                plannedIncome={plannedIncome}
                actualIncome={actualIncome}
                plannedBills={billsPlanned}
                actualBills={billsActual}
                plannedExpenses={plannedExpenses}
                actualExpenses={actualExpenses}
                plannedDebt={debtsPlanned}
                actualDebt={debtsActual}
                plannedSavings={savingsPlanned}
                actualSavings={actualSavings}
                currency={currency}
              />
              <AmountLeftChart
                income={actualIncome}
                bills={billsActual}
                expenses={actualExpenses}
                debt={debtsActual}
                savings={actualSavings}
                currency={currency}
              />
              <BudgetSummaryCard
                income={actualIncome}
                totalAllocated={totalAllocated}
                savingsRate={savingsRate}
                amountLeft={amountLeft}
                currency={currency}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <BudgetIncomeTable
                plannedIncome={plannedIncome}
                onUpdatePlannedIncome={updatePlannedIncome}
                incomes={income}
                currency={currency}
              />
              <AllocationSummaryChart
                bills={billsActual}
                expenses={actualExpenses}
                debt={debtsActual}
                savings={actualSavings}
                currency={currency}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <BudgetBillsTable
                bills={bills}
                onAdd={addBill}
                onUpdate={updateBill}
                onDelete={deleteBill}
                currency={currency}
              />
              <BudgetExpensesTable
                expenses={expenses}
                budgets={budgets}
                currency={currency}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetDebtsTable
                debts={debts}
                onAdd={addDebt}
                onUpdate={updateDebt}
                onDelete={deleteDebt}
                currency={currency}
              />
              <BudgetSavingsTable
                plannedSavings={plannedSavings}
                actualSavings={actualSavings}
                savingsByGoal={savingsByGoal}
                onAdd={addPlannedSaving}
                onUpdate={updatePlannedSaving}
                onDelete={deletePlannedSaving}
                currency={currency}
              />
            </div>
          </main>
        </div>
        <FloatingAIButton />
      </div>
    </SidebarProvider>
  );
};

export default Budget;
