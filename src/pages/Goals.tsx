
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FloatingAIButton from "@/components/FloatingAIButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Goals = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Auto-enable AI assistant by default
  useEffect(() => {
    const aiSetting = localStorage.getItem("aiAssistant");
    if (aiSetting === null) {
      localStorage.setItem("aiAssistant", "true");
    }
  }, []);

  const goals = [
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'business', label: 'Small Business', icon: '🏪' },
    { id: 'emergency', label: 'Emergency', icon: '⚠️' }
  ];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-white">ISave</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 space-y-3">
            <h1 className="text-3xl font-bold text-foreground">What are you saving for?</h1>
            <p className="text-muted-foreground">Choose a goal to get started</p>
          </div>

          <div className="space-y-4 mb-8">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`w-full p-4 rounded-xl border transition-colors flex items-center gap-4 ${
                  selectedGoals.includes(goal.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                }`}
              >
                <span className="text-2xl">{goal.icon}</span>
                <span className="text-lg font-medium text-foreground">{goal.label}</span>
              </button>
            ))}
          </div>

          <Button 
            onClick={handleContinue}
            disabled={selectedGoals.length === 0}
            className="w-full py-4 text-lg rounded-xl"
          >
            Continue
          </Button>
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
};

export default Goals;
