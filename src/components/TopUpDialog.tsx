import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useGoalTopUp } from '@/hooks/useGoalTopUp';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface TopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  onSuccess?: () => void;
}

export const TopUpDialog = ({
  open,
  onOpenChange,
  goalId,
  goalName,
  currentAmount,
  targetAmount,
  onSuccess
}: TopUpDialogProps) => {
  const [amount, setAmount] = useState('');
  const { topUpGoal, loading } = useGoalTopUp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const remainingAmount = targetAmount - currentAmount;
  const maxAmount = Math.max(0, remainingAmount);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const topUpAmount = Number(amount);
    if (!topUpAmount || topUpAmount <= 0) {
      return;
    }

    const success = await topUpGoal(goalId, topUpAmount);
    if (success) {
      setAmount('');
      onOpenChange(false);
      
      // Show additional confirmation toast
      toast({
        title: "Top-up Successful! 💰",
        description: `Successfully added ${formatCurrency(topUpAmount)} to ${goalName}`,
      });
      
      // Call onSuccess callback or navigate back to dashboard
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = Math.round(remainingAmount * percentage);
    setAmount(quickAmount.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top Up Goal: {goalName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Amount:</span>
              <span className="font-medium">{formatCurrency(currentAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Target Amount:</span>
              <span className="font-medium">{formatCurrency(targetAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Remaining:</span>
              <span className="font-medium text-secondary">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Top-up Amount (RWF)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={maxAmount}
                required
              />
            </div>

            {remainingAmount > 0 && (
              <div className="space-y-2">
                <Label>Quick amounts:</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(0.25)}
                  >
                    25%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(0.5)}
                  >
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(1)}
                  >
                    Complete
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !amount || Number(amount) <= 0}
                className="flex-1"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Top Up
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};