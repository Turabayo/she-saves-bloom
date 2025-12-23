
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FloatingAIButton from "@/components/FloatingAIButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/ui/loader";

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
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-cta rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">I</span>
          </div>
          <span className="text-2xl font-bold text-foreground">ISave</span>
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
                className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 min-h-[56px] ${
                  selectedGoals.includes(goal.id)
                    ? 'border-transparent bg-gradient-cta text-white shadow-lg hover:brightness-110'
                    : 'border-border bg-card text-foreground hover:bg-accent'
                }`}
              >
                <span className="text-2xl">{goal.icon}</span>
                <span className="text-lg font-medium">{goal.label}</span>
              </button>
            ))}
          </div>

          <Button 
            onClick={handleContinue}
            disabled={selectedGoals.length === 0}
            className="w-full py-4 text-lg rounded-xl min-h-[48px]"
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
