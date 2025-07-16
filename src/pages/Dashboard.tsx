
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import InsightsCard from "@/components/InsightsCard";
import FloatingAIButton from "@/components/FloatingAIButton";
import TransactionHistory from "@/components/TransactionHistory";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Target, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";
import { useTransactionInsights } from "@/hooks/useTransactionInsights";
import { useTopUps } from "@/hooks/useTopUps";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatCurrency } from "@/utils/dateFormatter";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { investments, loading: investmentsLoading } = useInvestments();
  const { insights, loading: insightsLoading } = useTransactionInsights();
  const { topUps, loading: topUpsLoading, getTotalSavings, getMonthlyAverage } = useTopUps();
  const { toast } = useToast();

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

    const channel = supabase
      .channel('payment-notifications')
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  if (authLoading || investmentsLoading || insightsLoading || topUpsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const totalSavings = getTotalSavings();
  const monthlyAverage = getMonthlyAverage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
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
            <div className="bg-card rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={20} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Net Savings</span>
              </div>
              <div className="text-xl font-bold text-card-foreground">
                {formatCurrency(totalSavings)}
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={20} className="text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Monthly Avg</span>
              </div>
              <div className="text-xl font-bold text-card-foreground">
                {formatCurrency(monthlyAverage)}
              </div>
            </div>
          </div>

          {/* Add Money Button */}
          <div className="mb-6">
            <Button 
              onClick={() => navigate('/top-up')}
              className="w-full"
              size="lg"
            >
              <Plus size={16} className="mr-2" />
              Add Money
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => navigate('/investments')}
              className="bg-card rounded-xl p-4 text-left shadow-sm border"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="text-blue-600" size={20} />
                </div>
              </div>
              <div className="font-medium text-card-foreground">Investments</div>
              <div className="text-sm text-muted-foreground">{investments.length} active</div>
            </button>

            <button 
              onClick={() => navigate('/insights')}
              className="bg-card rounded-xl p-4 text-left shadow-sm border"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
              </div>
              <div className="font-medium text-card-foreground">Insights</div>
              <div className="text-sm text-muted-foreground">View trends</div>
            </button>
          </div>

          {/* Recent Top-ups */}
          {topUps.length > 0 && (
            <div className="bg-card rounded-xl p-6 mb-6 shadow-sm">
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
            </div>
          )}

          {/* Insights Card */}
          <InsightsCard />

          {/* Transaction History */}
          <TransactionHistory />
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
};

export default Dashboard;
