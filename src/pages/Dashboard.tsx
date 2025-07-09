
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import InsightsCard from "@/components/InsightsCard";
import FloatingAIButton from "@/components/FloatingAIButton";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Target, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";
import { useTransactionInsights } from "@/hooks/useTransactionInsights";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { investments, loading: investmentsLoading } = useInvestments();
  const { insights, loading: insightsLoading } = useTransactionInsights();

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

  if (authLoading || investmentsLoading || insightsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const totalSavings = investments.reduce((sum, investment) => sum + investment.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Good morning!</h1>
            <p className="text-gray-600">Here's your savings overview</p>
          </div>

          {/* Total Savings */}
          <div className="bg-orange-500 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={24} />
              <span className="text-lg font-medium">Total Savings</span>
            </div>
            <div className="text-3xl font-bold mb-4">
              {totalSavings.toLocaleString()} RWF
            </div>
            <Button 
              onClick={() => navigate('/top-up')}
              className="bg-white text-orange-500 hover:bg-gray-100 font-medium"
            >
              <Plus size={16} className="mr-2" />
              Add Money
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => navigate('/investments')}
              className="bg-white rounded-xl p-4 text-left shadow-sm border"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="text-blue-600" size={20} />
                </div>
              </div>
              <div className="font-medium text-gray-900">Investments</div>
              <div className="text-sm text-gray-600">{investments.length} active</div>
            </button>

            <button 
              onClick={() => navigate('/insights')}
              className="bg-white rounded-xl p-4 text-left shadow-sm border"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
              </div>
              <div className="font-medium text-gray-900">Insights</div>
              <div className="text-sm text-gray-600">View trends</div>
            </button>
          </div>

          {/* Insights Card */}
          <InsightsCard />
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
};

export default Dashboard;
