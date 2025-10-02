
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import FloatingAIButton from "@/components/FloatingAIButton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";

const Goals = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { investments, loading: investmentsLoading } = useInvestments();

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

  if (authLoading || investmentsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-white mb-2">Goals</h1>
            <p className="text-slate-400">Manage and track your savings goals</p>
          </div>

          <div className="mb-6">
            <Button 
              onClick={() => navigate('/add-goal')}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-xl"
            >
              + Add Goal
            </Button>
          </div>

          {investments.length > 0 ? (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl shadow-sm">
              {investments.map((investment, index) => (
                <div 
                  key={investment.id} 
                  className={`flex items-center justify-between p-4 ${
                    index < investments.length - 1 ? 'border-b border-white/10' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{investment.name}</span>
                    {investment.category && (
                      <span className="text-sm text-slate-400">{investment.category}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">
                      {investment.amount.toLocaleString()} RWF
                    </span>
                    {investment.target_amount && (
                      <div className="text-sm text-slate-400">
                        Goal: {investment.target_amount.toLocaleString()} RWF
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl shadow-sm p-8 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">No goals yet</h3>
              <p className="text-slate-400 mb-4">Start building your financial future today</p>
              <Button 
                onClick={() => navigate('/add-goal')}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
              >
                Add Your First Goal
              </Button>
            </div>
          )}
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
};

export default Goals;
