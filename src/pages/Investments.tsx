
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Investments = () => {
  const navigate = useNavigate();
  
  const investments = [
    { name: "Emergency Fund", amount: 2500 },
    { name: "Education Fund", amount: 1800 },
    { name: "Retirement Fund", amount: 1200 },
    { name: "Small Business", amount: 1500 },
    { name: "Home Purchase", amount: 4300 },
  ];

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

          <div className="bg-white rounded-xl shadow-sm">
            {investments.map((investment, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-4 ${
                  index < investments.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <span className="text-gray-900 font-medium">{investment.name}</span>
                <span className="text-gray-900 font-semibold">
                  ${investment.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Investments;
