
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

const Dashboard = () => {
  const navigate = useNavigate();
  const [netWorth] = useState(25500);

  const investments = [
    { name: "Emergency Fund", amount: 2500 },
    { name: "Education Fund", amount: 11800 },
    { name: "Retirement Fund", amount: 1200 },
    { name: "Small Business", amount: 1500 },
    { name: "Home Purchase", amount: 4300 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          {/* Welcome Header */}
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Good morning!</h1>
            <p className="text-gray-600">Here's your financial progress</p>
          </div>

          {/* Net Worth Card */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Savings</h2>
            <p className="text-3xl font-bold text-gray-900">${netWorth.toLocaleString()}</p>
            <p className="text-green-600 text-sm mt-1">+12% this month</p>
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
            
            <div className="space-y-4">
              {investments.slice(0, 3).map((investment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{investment.name}</span>
                  <span className="font-semibold text-gray-900">
                    ${investment.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
