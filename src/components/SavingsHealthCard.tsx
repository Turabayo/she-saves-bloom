import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSavingsHealthScore } from '@/hooks/useSavingsHealthScore';
import { cn } from '@/lib/utils';

const getScoreColor = (score: number) => {
  if (score >= 70) return 'text-green-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
};

const getProgressColor = (score: number) => {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const SavingsHealthCard = () => {
  const { score, trend, breakdown, tips, loading } = useSavingsHealthScore();

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Savings Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            Savings Health Score
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Your health score is based on: savings consistency ({breakdown.consistency}pts), 
                  goal progress ({breakdown.goalProgress}pts), and auto-savings usage ({breakdown.autoSavingsUsage}pts).
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <div className={cn('flex items-center gap-1', trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-xs">{trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className={cn('text-4xl font-bold', getScoreColor(score))}>{score}</span>
            <span className="text-xl text-muted-foreground">/100</span>
          </div>
          <Badge variant="secondary" className={cn('text-xs', getScoreColor(score))}>
            {getScoreLabel(score)}
          </Badge>
        </div>

        <div className="relative h-2 overflow-hidden rounded-full bg-muted">
          <div 
            className={cn('h-full transition-all duration-500', getProgressColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Consistency</p>
            <p className="text-sm font-medium text-foreground">{breakdown.consistency}/40</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Goals</p>
            <p className="text-sm font-medium text-foreground">{breakdown.goalProgress}/30</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Auto-Save</p>
            <p className="text-sm font-medium text-foreground">{breakdown.autoSavingsUsage}/30</p>
          </div>
        </div>

        {/* Tips */}
        {tips.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">💡 Tip:</p>
            <p className="text-xs text-foreground">{tips[0]}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
