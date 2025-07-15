
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-foreground">SheSaves</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md w-full space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground leading-tight">
              Financial Empowerment for Women
            </h1>
            <p className="text-lg text-muted-foreground">
              Save smart, invest wisely, and build your financial future with SheSaves. Start your journey to financial independence today.
            </p>
          </div>

          <div className="space-y-4 w-full">
            <Button 
              className="w-full py-3 text-lg rounded-lg"
              onClick={() => navigate('/auth')}
            >
              Create Account
            </Button>
            
            <div className="text-center">
              <span className="text-muted-foreground">Already have an account? </span>
              <button 
                className="text-primary font-medium hover:underline"
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
