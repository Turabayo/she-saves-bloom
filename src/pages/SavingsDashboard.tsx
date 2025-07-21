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
import Navigation from "@/components/Navigation";
import FloatingAIButton from "@/components/FloatingAIButton";
import { Skeleton } from "@/components/ui/skeleton";
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
  }).format(amount);
};

const SavingsDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { goals, loading: goalsLoading } = useSavingsGoals();
  const { getTotalSavings } = useSavings();

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
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mobile-container py-6 space-y-6">
          <div className="desktop-grid">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const totalSavings = getTotalSavings();
  const completedGoals = goals.filter(goal => goal.progress === 100);
  const activeGoals = goals.filter(goal => goal.progress < 100);
  const totalGoalValue = goals.reduce((sum, goal) => sum + goal.goal_amount, 0);

  const handleTopUp = (goalId: string) => {
    navigate(`/top-up?goalId=${goalId}`);
  };

  const handleWithdraw = (goalId: string) => {
    navigate(`/withdraw?goalId=${goalId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mobile-container py-6 space-y-6">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <PiggyBank className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalSavings)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all goals
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-secondary" />
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

          <Card className="shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {completedGoals.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Goals reached
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Goal Value</CardTitle>
              <ChartLine className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(totalGoalValue)}
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
              <Button className="gradient-primary hover:opacity-90 flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Create New Goal
              </Button>
            }
          />
          <Button 
            onClick={() => navigate('/analytics')}
            variant="outline" 
            className="hover-lift flex-1"
          >
            <ChartLine className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button 
            onClick={() => navigate('/top-up')}
            variant="outline" 
            className="hover-lift flex-1"
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Top Up
          </Button>
        </div>

        {/* Completed Goals Celebration */}
        {completedGoals.length > 0 && (
          <Card className="gradient-success text-white shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎉 Congratulations!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90">
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
                  <h2 className="text-xl font-semibold">Completed Goals</h2>
                  <Badge className="gradient-success text-white">
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
          <Card className="shadow-soft text-center py-12">
            <CardContent className="space-y-4">
              <div className="text-6xl mb-4">🎯</div>
              <CardTitle className="text-2xl">Start Your Savings Journey</CardTitle>
              <p className="text-muted-foreground max-w-md mx-auto">
                Create your first savings goal and start building towards your dreams. 
                Whether it's a new car, house, or vacation - every goal starts with a single step!
              </p>
              <CreateGoalDialog 
                trigger={
                  <Button size="lg" className="gradient-primary hover:opacity-90 mt-4">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Goal
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>

      <FloatingAIButton />
    </div>
  );
};

export default SavingsDashboard;