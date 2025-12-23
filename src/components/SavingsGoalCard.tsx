import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Plus, Wallet } from "lucide-react";
import { SavingsGoal } from "@/hooks/useSavingsGoals";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onTopUp: (goalId: string) => void;
  onWithdraw: (goalId: string) => void;
  className?: string;
}

import { formatCurrency, formatCurrencyCompact } from "@/utils/dateFormatter";

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    'Car': '🚗',
    'House': '🏠',
    'School': '🎓',
    'Shoes': '👟',
    'Dress': '👗',
    'Travel': '✈️',
    'Electronics': '📱',
    'Emergency': '🆘',
    'Investment': '📈',
  };
  return icons[category] || '🎯';
};

export const SavingsGoalCard = ({ goal, onTopUp, onWithdraw, className = "" }: SavingsGoalCardProps) => {
  const isCompleted = goal.progress === 100;
  const currentAmount = goal.current_amount || 0;

  return (
    <Card className={`bg-white/5 backdrop-blur border border-white/10 rounded-xl transition-all duration-300 hover:bg-white/10 ${isCompleted ? 'ring-2 ring-primary animate-bounce-subtle' : ''} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getCategoryIcon(goal.category)}</div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">{goal.name}</CardTitle>
              <Badge variant="secondary" className="text-xs bg-secondary/20 text-secondary border border-secondary/20">
                {goal.category}
              </Badge>
            </div>
          </div>
          {isCompleted && (
            <Badge className="bg-gradient-cta text-white">
              🎯 Goal Reached!
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Progress</span>
            <span className="font-medium text-white">{goal.progress}%</span>
          </div>
          <Progress 
            value={goal.progress} 
            className="h-3"
          />
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 text-xs sm:text-sm">
              {formatCurrencyCompact(currentAmount)}
            </span>
            <span className="font-medium text-white text-xs sm:text-sm">
              {formatCurrencyCompact(goal.goal_amount)}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-slate-400">Saved</span>
            <span className="font-medium text-primary text-xs">
              {formatCurrencyCompact(currentAmount)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-secondary" />
            <span className="text-slate-400">Remaining</span>
            <span className="font-medium text-white text-xs">
              {formatCurrencyCompact(Math.max(0, goal.goal_amount - currentAmount))}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onTopUp(goal.id)}
            className="flex-1 bg-gradient-cta hover:brightness-110 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Top Up
          </Button>
          
          {currentAmount > 0 && (
            <Button 
              onClick={() => onWithdraw(goal.id)}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          )}
        </div>

        {isCompleted && (
          <div className="mt-3 p-3 bg-gradient-cta rounded-lg text-white text-center text-sm font-medium">
            🎉 Congratulations! You can now buy your {goal.name}!
          </div>
        )}
      </CardContent>
    </Card>
  );
};