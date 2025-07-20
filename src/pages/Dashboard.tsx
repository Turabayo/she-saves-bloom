import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Target, Minus, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useSavings } from "@/hooks/useSavings";
import { useTransactionInsights } from "@/hooks/useTransactionInsights";
import { useTopUps } from "@/hooks/useTopUps";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { formatCurrency, formatDate } from "@/utils/dateFormatter";
import InsightsCard from "@/components/InsightsCard";
import FloatingAIButton from "@/components/FloatingAIButton";
import TransactionHistory from "@/components/TransactionHistory";
import { TransactionCharts } from "@/components/TransactionCharts";
import { WithdrawDialog } from "@/components/WithdrawDialog";
import { WithdrawalHistory } from "@/components/WithdrawalHistory";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { getTotalSavings } = useSavings();
  const { insights, loading: insightsLoading } = useTransactionInsights();
  const { topUps, loading: topUpsLoading, getMonthlyAverage } = useTopUps();
  const { loading: withdrawalsLoading } = useWithdrawals();
  const { toast } = useToast();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Auto-enable AI assistant by default
  useEffect(() => {
    const aiSetting = localStorage.getItem("aiAssistant");
    if (aiSetting === null) {
      localStorage.setItem("aiAssistant", "true");
    }
  }, []);

  // Set up realtime notifications for successful payments
  useEffect(() => {
    if (!user) return;

    // Clean up any existing channel first
    if (channelRef.current) {
      console.log('Cleaning up existing channel before creating new one');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelName = `payment-notifications-${user.id}`;
    console.log('Creating payment notifications channel:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'momo_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newStatus = payload.new?.status;
          const oldStatus = payload.old?.status;
          
          console.log('Payment status change:', { oldStatus, newStatus });
          
          // Show notification when payment becomes successful
          if (newStatus === 'SUCCESSFUL' && oldStatus !== 'SUCCESSFUL') {
            toast({
              title: "✅ MoMo Payment Confirmed",
              description: "Your balance has been updated.",
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up payment notifications channel:', channelName);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]); // Removed toast dependency

  if (authLoading || insightsLoading || topUpsLoading || withdrawalsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const totalSavings = getTotalSavings();
  const monthlyAverage = getMonthlyAverage();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <main className="px-4 pb-20">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="py-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Welcome back, {user?.user_metadata?.full_name || 'there'}!
              </h1>
              <p className="text-muted-foreground">Here's your financial overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={20} className="text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Total Savings</span>
                </div>
                <div className="text-xl font-bold text-card-foreground">
                  {formatCurrency(totalSavings)}
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={20} className="text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Monthly Avg</span>
                </div>
                <div className="text-xl font-bold text-card-foreground">
                  {formatCurrency(monthlyAverage)}
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button 
                onClick={() => navigate('/top-up')}
                className="w-full"
                size="lg"
              >
                <Plus size={16} className="mr-2" />
                Add Money
              </Button>
              
              <WithdrawDialog>
                <Button variant="outline" className="w-full" size="lg">
                  <Minus size={16} className="mr-2" />
                  Withdraw
                </Button>
              </WithdrawDialog>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => navigate('/goals')}
                className="bg-card rounded-xl p-4 text-left shadow-sm border hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Target className="text-primary" size={20} />
                  </div>
                </div>
                <div className="font-medium text-card-foreground">Savings Goals</div>
                <div className="text-sm text-muted-foreground">Track progress</div>
              </button>

              <button 
                onClick={() => navigate('/insights')}
                className="bg-card rounded-xl p-4 text-left shadow-sm border hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-primary" size={20} />
                  </div>
                </div>
                <div className="font-medium text-card-foreground">Insights</div>
                <div className="text-sm text-muted-foreground">View trends</div>
              </button>
            </div>

            {/* Recent Top-ups */}
            {topUps.length > 0 && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Top-ups</h3>
                <div className="space-y-3">
                  {topUps.slice(0, 3).map((topUp) => (
                    <div key={topUp.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-card-foreground">{formatCurrency(topUp.amount)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(topUp.created_at)}</p>
                      </div>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        {topUp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Insights Card */}
            <InsightsCard />

            {/* Transaction History */}
            <TransactionHistory />
          </div>
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <main className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome back, {user?.user_metadata?.full_name || 'there'}!
            </h1>
            <p className="text-lg text-muted-foreground">Here's your complete financial dashboard</p>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target size={16} className="text-primary" />
                  Total Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(totalSavings)}
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
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(monthlyAverage)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Button 
                  onClick={() => navigate('/top-up')}
                  className="w-full"
                  size="lg"
                >
                  <Plus size={16} className="mr-2" />
                  Add Money
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <WithdrawDialog>
                  <Button variant="outline" className="w-full" size="lg">
                    <Minus size={16} className="mr-2" />
                    Withdraw Money
                  </Button>
                </WithdrawDialog>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Charts */}
          <div className="mb-8">
            <TransactionCharts />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <InsightsCard />
            </div>
            <div className="lg:col-span-1">
              <WithdrawalHistory />
            </div>
            <div className="lg:col-span-1">
              <TransactionHistory />
            </div>
          </div>
        </main>
      </div>

      <FloatingAIButton />
    </div>
  );
};

export default Dashboard;