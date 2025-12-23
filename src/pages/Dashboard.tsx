import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarSpacer } from "@/components/ui/sidebar";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Target, Minus } from "lucide-react";
import { useSavings } from "@/hooks/useSavings";
import { useTopUps } from "@/hooks/useTopUps";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { useRealSavingsInsights } from "@/hooks/useRealSavingsInsights";
import { formatCurrency, formatCurrencyCompact, formatDate } from "@/utils/dateFormatter";
import FloatingAIButton from "@/components/FloatingAIButton";
import TransactionHistory from "@/components/TransactionHistory";
import { TransactionCharts } from "@/components/TransactionCharts";
import { WithdrawDialog } from "@/components/WithdrawDialog";
import { WithdrawalHistory } from "@/components/WithdrawalHistory";
import { SavingsHealthCard } from "@/components/SavingsHealthCard";
import { MonthlySummaryCard } from "@/components/MonthlySummaryCard";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/ui/loader";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { topUps, loading: topUpsLoading } = useTopUps();
  const { loading: withdrawalsLoading } = useWithdrawals();
  const { insights, loading: insightsLoading } = useRealSavingsInsights();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const aiSetting = localStorage.getItem("aiAssistant");
    if (aiSetting === null) {
      localStorage.setItem("aiAssistant", "true");
    }
  }, []);

  if (authLoading || topUpsLoading || withdrawalsLoading || insightsLoading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  const totalSavings = insights?.totalSavings || 0;
  const monthlyAverage = insights?.monthlyAverage || 0;

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarSpacer />
        <div className="flex-1 flex flex-col min-w-0">
          <Navigation />
          <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Welcome back, {user?.user_metadata?.full_name || 'there'}!
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">Here's your complete financial dashboard</p>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    Total Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrencyCompact(totalSavings)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary" />
                    Monthly Average
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrencyCompact(monthlyAverage)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <Button 
                    onClick={() => navigate('/top-up')}
                    className="w-full min-h-[44px]"
                    size="lg"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Money
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <WithdrawDialog>
                    <Button variant="secondary" className="w-full min-h-[44px]" size="lg">
                      <Minus size={16} className="mr-2" />
                      Withdraw Money
                    </Button>
                  </WithdrawDialog>
                </CardContent>
              </Card>
            </div>

            {/* Health Score & Monthly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <SavingsHealthCard />
              <MonthlySummaryCard />
            </div>

            {/* Transaction Charts */}
            <div className="mb-8">
              <TransactionCharts />
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <WithdrawalHistory />
              </div>
              <div>
                <TransactionHistory />
              </div>
            </div>
          </main>
          <FloatingAIButton />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
