import { useMemo } from 'react';
import { useRealSavingsInsights } from './useRealSavingsInsights';
import { useSavingsGoals } from './useSavingsGoals';
import { useScheduledSavings } from './useScheduledSavings';

interface HealthScoreDetails {
  score: number;
  trend: 'up' | 'down' | 'stable';
  breakdown: {
    consistency: number;
    goalProgress: number;
    autoSavingsUsage: number;
  };
  tips: string[];
}

export const useSavingsHealthScore = (): HealthScoreDetails & { loading: boolean } => {
  const { insights, loading: insightsLoading } = useRealSavingsInsights();
  const { goals, loading: goalsLoading } = useSavingsGoals();
  const { scheduledSavings, loading: scheduledLoading } = useScheduledSavings();

  const loading = insightsLoading || goalsLoading || scheduledLoading;

  const healthDetails = useMemo(() => {
    if (loading) {
      return {
        score: 0,
        trend: 'stable' as const,
        breakdown: { consistency: 0, goalProgress: 0, autoSavingsUsage: 0 },
        tips: []
      };
    }

    // Calculate consistency score (0-40 points)
    // Based on having regular savings activity
    let consistencyScore = 0;
    const totalSavings = insights?.totalSavings || 0;
    const monthlyAverage = insights?.monthlyAverage || 0;

    if (totalSavings > 0) consistencyScore += 10;
    if (monthlyAverage > 0) consistencyScore += 15;
    if (monthlyAverage >= 10000) consistencyScore += 15; // Bonus for good monthly savings

    // Calculate goal progress score (0-30 points)
    let goalProgressScore = 0;
    const activeGoals = goals || [];
    
    if (activeGoals.length > 0) {
      goalProgressScore += 10; // Has goals set up
      
      const avgProgress = activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length;
      goalProgressScore += Math.min(20, Math.floor(avgProgress / 5)); // Up to 20 more points based on progress
    }

    // Calculate auto-savings usage score (0-30 points)
    let autoSavingsScore = 0;
    const activeAutoSavings = (scheduledSavings || []).filter(s => s.is_active);

    if (activeAutoSavings.length > 0) {
      autoSavingsScore = 15; // Base points for having auto-savings
      autoSavingsScore += Math.min(15, activeAutoSavings.length * 5); // Bonus for multiple rules
    }

    const totalScore = Math.min(100, consistencyScore + goalProgressScore + autoSavingsScore);

    // Determine trend (simplified - in real app would compare to last month)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (totalScore >= 60) trend = 'up';
    else if (totalScore < 40) trend = 'down';

    // Generate tips based on scores
    const tips: string[] = [];
    if (consistencyScore < 20) {
      tips.push('Start saving regularly to build consistency');
    }
    if (goalProgressScore < 10) {
      tips.push('Set up savings goals to track your progress');
    }
    if (autoSavingsScore < 15) {
      tips.push('Enable auto-savings to save automatically');
    }
    if (totalScore >= 70) {
      tips.push("Great job! You're on track to financial freedom");
    }

    return {
      score: totalScore,
      trend,
      breakdown: {
        consistency: consistencyScore,
        goalProgress: goalProgressScore,
        autoSavingsUsage: autoSavingsScore
      },
      tips
    };
  }, [insights, goals, scheduledSavings, loading]);

  return {
    ...healthDetails,
    loading
  };
};
