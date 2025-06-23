
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { investments, loading: investmentsLoading, getTotalSavings } = useInvestments();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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

  const totalSavings = getTotalSavings();
  const displayInvestments = investments.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          {/* Welcome Header */}
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Good morning, {user.user_metadata?.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-gray-600">Here's your financial progress</p>
          </div>

          {/* Net Worth Card */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Savings</h2>
            <p className="text-3xl font-bold text-gray-900">${totalSavings.toLocaleString()}</p>
            <p className="text-green-600 text-sm mt-1">
              {investments.length} {investments.length === 1 ? 'investment' : 'investments'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button 
              onClick={() => navigate('/add-investment')}
              className="bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg"
            >
              + Add Investment
            </Button>
            <Button 
              onClick={() => navigate('/assistant')}
              variant="outline"
              className="border-gray-300 py-4 rounded-lg"
            >
              💡 Get Tips
            </Button>
          </div>

          {/* Investment Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/investments')}
                className="text-orange-500"
              >
                View All
              </Button>
            </div>
            
            {displayInvestments.length > 0 ? (
              <div className="space-y-4">
                {displayInvestments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{investment.name}</span>
                    <span className="font-semibold text-gray-900">
                      ${investment.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No investments yet</p>
                <Button 
                  onClick={() => navigate('/add-investment')}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Add Your First Investment
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
