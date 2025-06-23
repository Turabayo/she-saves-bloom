
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">SheSaves</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md w-full space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Financial Empowerment for Women
            </h1>
            <p className="text-lg text-gray-600">
              Take control of your finances and start investing with our easy-to-use platform.
            </p>
          </div>

          <div className="space-y-4 w-full">
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg rounded-lg"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
            
            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button 
                className="text-orange-500 font-medium"
                onClick={() => navigate('/auth')}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
