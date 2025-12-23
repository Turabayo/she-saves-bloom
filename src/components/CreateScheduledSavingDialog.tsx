import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useScheduledSavings, ScheduledSaving, CreateScheduledSavingInput } from "@/hooks/useScheduledSavings";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateScheduledSavingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingRule?: ScheduledSaving | null;
}

export const CreateScheduledSavingDialog = ({ 
  open, 
  onOpenChange, 
  onSuccess,
  editingRule 
}: CreateScheduledSavingDialogProps) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "one-time">("monthly");
  const [goalId, setGoalId] = useState<string>("");
  const [nextExecutionDate, setNextExecutionDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addScheduledSaving, updateScheduledSaving } = useScheduledSavings();
  const { goals } = useSavingsGoals();
  const { t } = useLanguage();

  const isEditing = !!editingRule;

  // Populate form when editing
  useEffect(() => {
    if (editingRule) {
      setName(editingRule.name);
      setAmount(String(editingRule.amount));
      setFrequency(editingRule.frequency);
      setGoalId(editingRule.goal_id || "");
      setNextExecutionDate(editingRule.next_execution_date);
    } else {
      // Reset form for new entry
      setName("");
      setAmount("");
      setFrequency("monthly");
      setGoalId("");
      setNextExecutionDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }
  }, [editingRule, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    setIsSubmitting(true);
    try {
      const savingData: CreateScheduledSavingInput = {
        name,
        amount: parseFloat(amount),
        frequency,
        goal_id: goalId || null,
        next_execution_date: nextExecutionDate,
        is_active: true,
      };

      if (isEditing && editingRule) {
        await updateScheduledSaving(editingRule.id, savingData);
      } else {
        await addScheduledSaving(savingData);
      }
      
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
          <DialogTitle>
            {isEditing ? "Edit Savings Rule" : t('createScheduledSaving')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              placeholder="e.g., Weekly Savings"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (RWF)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(value: "daily" | "weekly" | "monthly" | "one-time") => setFrequency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Linked Goal (Optional)</Label>
            <Select value={goalId} onValueChange={setGoalId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a goal or leave empty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">General Savings</SelectItem>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nextDate">Start Date</Label>
            <Input
              id="nextDate"
              type="date"
              value={nextExecutionDate}
              onChange={(e) => setNextExecutionDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
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
              disabled={isSubmitting || !name || !amount}
              className="flex-1"
            >
              {isSubmitting ? "Saving..." : (isEditing ? "Update Rule" : "Create Rule")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};