import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useSavings } from "@/hooks/useSavings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SavingsGoalCard } from "@/components/SavingsGoalCard";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { TopUpDialog } from "@/components/TopUpDialog";
import Navigation from "@/components/Navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import FloatingAIButton from "@/components/FloatingAIButton";
import { LoadingScreen } from "@/components/ui/loader";
import { 
  Wallet, 
  TrendingUp, 
  Target, 
  Plus,
  PiggyBank,
  ChartLine,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import { formatCurrency, formatCurrencyCompact } from "@/utils/dateFormatter";

const SavingsDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { goals, loading: goalsLoading, refetch: refetchGoals } = useSavingsGoals();
  const { getTotalSavings } = useSavings();
  const [selectedGoalForTopUp, setSelectedGoalForTopUp] = useState<string | null>(null);
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Initialize AI assistant setting
  useEffect(() => {
    const aiAssistant = localStorage.getItem('aiAssistant');
    if (!aiAssistant) {
      localStorage.setItem('aiAssistant', 'true');
    }
  }, []);

  if (authLoading || goalsLoading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  const totalSavings = getTotalSavings();
  const completedGoals = goals.filter(goal => goal.progress === 100);
  const activeGoals = goals.filter(goal => goal.progress < 100);
  const totalGoalValue = goals.reduce((sum, goal) => sum + goal.goal_amount, 0);

  const handleTopUp = (goalId: string) => {
    setSelectedGoalForTopUp(goalId);
    setShowTopUpDialog(true);
  };

  const handleWithdraw = (goalId: string) => {
    navigate(`/withdraw?goalId=${goalId}`);
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navigation />
          <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Track your savings goals and build your financial future
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Savings</CardTitle>
              <PiggyBank className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-foreground">
                {formatCurrencyCompact(totalSavings)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all goals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {activeGoals.length}
              </div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {completedGoals.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Goals reached
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Goal Value</CardTitle>
              <ChartLine className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-foreground">
                {formatCurrencyCompact(totalGoalValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total target
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <CreateGoalDialog 
            trigger={
              <Button className="flex-1 min-h-[44px]">
                <Plus className="h-4 w-4 mr-2" />
                Create New Goal
              </Button>
            }
            onSuccess={refetchGoals}
          />
          <Button 
            onClick={() => navigate('/insights')}
            variant="secondary" 
            className="flex-1 min-h-[44px]"
          >
            <ChartLine className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button 
            onClick={() => navigate('/top-up')}
            variant="secondary" 
            className="flex-1 min-h-[44px]"
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Top Up
          </Button>
        </div>

        {/* Completed Goals Celebration */}
        {completedGoals.length > 0 && (
          <Card className="bg-success/10 border-success/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                🎉 Congratulations!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">
                You've completed {completedGoals.length} goal{completedGoals.length > 1 ? 's' : ''}! 
                Keep up the amazing work!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Goals Grid */}
        {goals.length > 0 ? (
          <div className="space-y-6">
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Active Goals</h2>
                  <Badge variant="secondary">{activeGoals.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeGoals.map((goal) => (
                    <SavingsGoalCard
                      key={goal.id}
                      goal={goal}
                      onTopUp={handleTopUp}
                      onWithdraw={handleWithdraw}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Completed Goals</h2>
                  <Badge className="bg-success text-white">
                    {completedGoals.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedGoals.map((goal) => (
                    <SavingsGoalCard
                      key={goal.id}
                      goal={goal}
                      onTopUp={handleTopUp}
                      onWithdraw={handleWithdraw}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="text-6xl mb-4">🎯</div>
              <CardTitle className="text-2xl text-foreground">Start Your Savings Journey</CardTitle>
              <p className="text-muted-foreground max-w-md mx-auto">
                Create your first savings goal and start building towards your dreams. 
                Whether it's a new car, house, or vacation - every goal starts with a single step!
              </p>
              <CreateGoalDialog 
                trigger={
                  <Button size="lg" className="mt-4 min-h-[48px]">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Goal
                  </Button>
                }
                onSuccess={refetchGoals}
              />
            </CardContent>
          </Card>
        )}
          </main>

          {/* Top Up Dialog */}
          {selectedGoalForTopUp && (
            <TopUpDialog
              open={showTopUpDialog}
              onOpenChange={setShowTopUpDialog}
              goalId={selectedGoalForTopUp}
              goalName={goals.find(g => g.id === selectedGoalForTopUp)?.name || ''}
              currentAmount={goals.find(g => g.id === selectedGoalForTopUp)?.current_amount || 0}
              targetAmount={goals.find(g => g.id === selectedGoalForTopUp)?.goal_amount || 0}
              onSuccess={() => {
                refetchGoals();
                setSelectedGoalForTopUp(null);
              }}
            />
          )}

          <FloatingAIButton />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SavingsDashboard;