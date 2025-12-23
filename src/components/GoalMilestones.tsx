import { useMemo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GoalMilestonesProps {
  progress: number;
  goalName: string;
  showCelebration?: boolean;
}

const milestones = [
  { percent: 25, label: '25%', emoji: '🌱' },
  { percent: 50, label: '50%', emoji: '🔥' },
  { percent: 75, label: '75%', emoji: '⭐' },
  { percent: 100, label: '100%', emoji: '🎯' }
];

const motivationalMessages: Record<number, string[]> = {
  25: ["Great start! You're building momentum 💪", "One quarter done! Keep it up!"],
  50: ["Halfway there! You're crushing it 🔥", "You're halfway to your goal!"],
  75: ["Almost there! The finish line is in sight ⭐", "Just a bit more to go!"],
  100: ["Congratulations! Goal achieved! 🎉", "You did it! Time to celebrate!"]
};

export const GoalMilestones = ({ progress, goalName, showCelebration = true }: GoalMilestonesProps) => {
  const [celebratingMilestone, setCelebratingMilestone] = useState<number | null>(null);
  const [lastCheckedProgress, setLastCheckedProgress] = useState(0);

  const currentMilestone = useMemo(() => {
    if (progress >= 100) return 100;
    if (progress >= 75) return 75;
    if (progress >= 50) return 50;
    if (progress >= 25) return 25;
    return 0;
  }, [progress]);

  // Check for milestone achievements
  useEffect(() => {
    if (!showCelebration) return;

    const previousMilestone = (() => {
      if (lastCheckedProgress >= 100) return 100;
      if (lastCheckedProgress >= 75) return 75;
      if (lastCheckedProgress >= 50) return 50;
      if (lastCheckedProgress >= 25) return 25;
      return 0;
    })();

    if (currentMilestone > previousMilestone && currentMilestone > 0) {
      setCelebratingMilestone(currentMilestone);
      setTimeout(() => setCelebratingMilestone(null), 3000);
    }

    setLastCheckedProgress(progress);
  }, [progress, currentMilestone, showCelebration, lastCheckedProgress]);

  const getMessage = (milestone: number) => {
    const messages = motivationalMessages[milestone];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="space-y-3">
      {/* Milestone Markers */}
      <div className="relative">
        <div className="flex justify-between items-center">
          {milestones.map((milestone) => {
            const isReached = progress >= milestone.percent;
            const isCelebrating = celebratingMilestone === milestone.percent;
            
            return (
              <div
                key={milestone.percent}
                className={cn(
                  'flex flex-col items-center transition-all duration-300',
                  isCelebrating && 'animate-bounce'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300',
                    isReached
                      ? 'bg-primary text-primary-foreground scale-110'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isReached ? milestone.emoji : milestone.label}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1 transition-colors',
                    isReached ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}
                >
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Connecting Line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-10">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(100, (progress / 100) * 100)}%` }}
          />
        </div>
      </div>

      {/* Celebration Message */}
      {celebratingMilestone && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-primary">
              🎉 {getMessage(celebratingMilestone)}
            </p>
            {celebratingMilestone === 100 && (
              <p className="text-xs text-muted-foreground mt-1">
                You can now buy your {goalName}!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Current Progress Message */}
      {currentMilestone > 0 && currentMilestone < 100 && !celebratingMilestone && (
        <p className="text-xs text-muted-foreground text-center">
          {currentMilestone === 25 && `You're making progress on ${goalName}!`}
          {currentMilestone === 50 && `Halfway to ${goalName}! Keep saving!`}
          {currentMilestone === 75 && `Almost there! ${goalName} is within reach!`}
        </p>
      )}
    </div>
  );
};
