import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useScheduledSavings } from "@/hooks/useScheduledSavings";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateScheduledSavingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateScheduledSavingDialog = ({ open, onOpenChange, onSuccess }: CreateScheduledSavingDialogProps) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "one-time">("monthly");
  const [goalId, setGoalId] = useState<string>("");
  const [nextExecutionDate, setNextExecutionDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addScheduledSaving } = useScheduledSavings();
  const { goals } = useSavingsGoals();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    setIsSubmitting(true);
    try {
      await addScheduledSaving({
        name,
        amount: parseFloat(amount),
        frequency,
        goal_id: goalId || undefined,
        next_execution_date: nextExecutionDate,
        is_active: true,
      });
      
      // Reset form
      setName("");
      setAmount("");
      setFrequency("monthly");
      setGoalId("");
      setNextExecutionDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('createScheduledSaving')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('savingName')}</Label>
            <Input
              id="name"
              placeholder={t('savingNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amount')}</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">{t('frequency')}</Label>
            <Select value={frequency} onValueChange={(value: "weekly" | "monthly" | "one-time") => setFrequency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">{t('weekly')}</SelectItem>
                <SelectItem value="monthly">{t('monthly')}</SelectItem>
                <SelectItem value="one-time">{t('oneTime')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">{t('linkedGoal')} ({t('optional')})</Label>
            <Select value={goalId} onValueChange={setGoalId}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectGoal')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('noGoal')}</SelectItem>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nextDate">{t('nextExecutionDate')}</Label>
            <Input
              id="nextDate"
              type="date"
              value={nextExecutionDate}
              onChange={(e) => setNextExecutionDate(e.target.value)}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name || !amount}
              className="flex-1"
            >
              {isSubmitting ? t('creating') : t('createSchedule')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};