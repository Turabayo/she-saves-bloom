import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Plus, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useBudget } from "@/hooks/useBudget";
import { useExpenses } from "@/hooks/useExpenses";
import { CreateBudgetDialog } from "@/components/CreateBudgetDialog";
import { formatCurrency } from "@/utils/dateFormatter";
import { useToast } from "@/hooks/use-toast";

const Budget = () => {
  const { user } = useAuth();
  const { budgets, loading: budgetLoading, addBudget, updateBudget } = useBudget();
  const { expenses } = useExpenses();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Calculate spending by category for current month
  const getCurrentMonthSpending = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const spending = new Map();
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        const current = spending.get(expense.category) || 0;
        spending.set(expense.category, current + expense.amount);
      }
    });
    
    return spending;
  };

  const currentSpending = getCurrentMonthSpending();

  const getBudgetStatus = (budget: any) => {
    const spent = currentSpending.get(budget.category) || 0;
    const percentage = (spent / budget.amount) * 100;
    
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-400', bgColor: 'bg-red-500/10' };
    if (percentage >= 80) return { status: 'warning', color: 'text-amber-400', bgColor: 'bg-amber-500/10' };
    return { status: 'good', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' };
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = Array.from(currentSpending.values()).reduce((sum, amount) => sum + amount, 0);
  const remainingBudget = totalBudget - totalSpent;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pb-20 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budget Management</h1>
            <p className="text-muted-foreground">Track and control your spending</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus size={16} className="mr-2" />
            Create Budget
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalBudget)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown size={16} className="text-red-500" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalSpent)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp size={16} className={remainingBudget >= 0 ? "text-green-500" : "text-red-500"} />
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(remainingBudget)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Categories */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Budget Categories</h2>
          
          {budgets.length === 0 ? (
            <Card className="p-8 text-center">
              <DollarSign size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">No budgets yet</h3>
              <p className="text-muted-foreground mb-4">Create your first budget to start tracking your spending</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus size={16} className="mr-2" />
                Create Your First Budget
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {budgets.map((budget) => {
                const spent = currentSpending.get(budget.category) || 0;
                const percentage = Math.min((spent / budget.amount) * 100, 100);
                const status = getBudgetStatus(budget);
                
                return (
                  <Card key={budget.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{budget.category}</h3>
                        <p className="text-sm text-muted-foreground">{budget.description}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                        {status.status}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent: {formatCurrency(spent)}</span>
                        <span className="text-muted-foreground">Budget: {formatCurrency(budget.amount)}</span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${status.status === 'exceeded' ? '[&>div]:bg-red-400' : 
                          status.status === 'warning' ? '[&>div]:bg-amber-400' : '[&>div]:bg-emerald-400'}`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{percentage.toFixed(1)}% used</span>
                        <span>{formatCurrency(budget.amount - spent)} remaining</span>
                      </div>
                    </div>

                    {percentage >= 80 && (
                      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-400" />
                        <span className="text-sm text-amber-300">
                          {percentage >= 100 ? "Budget exceeded!" : "Approaching budget limit"}
                        </span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <CreateBudgetDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false);
            toast({
              title: "Budget created",
              description: "Your budget has been created successfully",
            });
          }}
        />
      </main>
    </div>
  );
};

export default Budget;