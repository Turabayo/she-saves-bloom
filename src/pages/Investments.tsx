
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import FloatingAIButton from "@/components/FloatingAIButton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";

const Investments = () => {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Investments</h1>
            <p className="text-gray-600">Manage and track your investment funds</p>
          </div>

          <div className="mb-6">
            <Button 
              onClick={() => navigate('/add-investment')}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
            >
              + Add Investment
            </Button>
          </div>

          {investments.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm">
              {investments.map((investment, index) => (
                <div 
                  key={investment.id} 
                  className={`flex items-center justify-between p-4 ${
                    index < investments.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-medium">{investment.name}</span>
                    {investment.category && (
                      <span className="text-sm text-gray-500">{investment.category}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900 font-semibold">
                      {investment.amount.toLocaleString()} RWF
                    </span>
                    {investment.target_amount && (
                      <div className="text-sm text-gray-500">
                        Goal: {investment.target_amount.toLocaleString()} RWF
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No investments yet</h3>
              <p className="text-gray-600 mb-4">Start building your financial future today</p>
              <Button 
                onClick={() => navigate('/add-investment')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Add Your First Investment
              </Button>
            </div>
          )}
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
};

export default Investments;
