
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useToast } from "@/hooks/use-toast";
import { Minus } from "lucide-react";

interface WithdrawDialogProps {
  children?: React.ReactNode;
}

export const WithdrawDialog = ({ children }: WithdrawDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { createWithdrawal } = useWithdrawals();
  const { goals: savingsGoals, loading: goalsLoading } = useSavingsGoals();
  const { toast } = useToast();

  // Debug logging
  console.log('=== SAVINGS GOALS DEBUG ===');
  console.log('Goals loading:', goalsLoading);
  console.log('All savings goals:', savingsGoals);
  console.log('Goals count:', savingsGoals.length);

  const availableGoals = savingsGoals.filter(goal => {
    // Only show goals that have some savings
    const goalSavings = goal.current_amount || 0;
    console.log(`Goal "${goal.name}": current_amount = ${goalSavings}`);
    return goalSavings > 0;
  });

  console.log('Available goals for withdrawal:', availableGoals);
  console.log('Available goals count:', availableGoals.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        description: "Please enter a valid amount"
      });
      return;
    }

    if (!phoneNumber) {
      toast({
        variant: "destructive",
        description: "Please enter your phone number"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('=== SUBMITTING WITHDRAWAL ===')
      console.log('Amount:', amount, 'Phone:', phoneNumber)
      console.log('Selected Goal ID (before cleaning):', selectedGoalId)
      console.log('Note (before cleaning):', note)
      
      // Clean the payload - ensure no undefined values are passed
      const cleanedPayload = {
        amount: parseFloat(amount),
        phone_number: phoneNumber,
        goal_id: selectedGoalId && selectedGoalId !== "no-goals" ? selectedGoalId : null,
        note: note?.trim() || null
      };

      console.log('Cleaned withdrawal payload:', cleanedPayload)

      const result = await createWithdrawal(cleanedPayload);

      console.log('Withdrawal result:', result)

      // Check if the result indicates success
      if (result && result.success) {
        toast({
          description: `Withdrawal request submitted successfully! Reference: ${result.referenceId || 'N/A'}`
        });

        setIsOpen(false);
        setAmount("");
        setSelectedGoalId("");
        setPhoneNumber("");
        setNote("");
      } else {
        // Handle failure case
        const errorMessage = result?.error || result?.details || "Failed to submit withdrawal request";
        console.error('Withdrawal failed:', errorMessage);
        
        toast({
          variant: "destructive",
          description: `Withdrawal failed: ${errorMessage}`
        });
      }
    } catch (error: any) {
      console.error('Error creating withdrawal:', error);
      
      // Parse the error message more carefully
      let errorMessage = "Failed to submit withdrawal request";
      
      if (error.message) {
        if (error.message.includes('transfer_failed')) {
          errorMessage = "MTN MoMo transfer failed. Please check your phone number and try again.";
        } else if (error.message.includes('credentials')) {
          errorMessage = "Payment service configuration issue. Please contact support.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full">
            <Minus className="w-4 h-4 mr-2" />
            Withdraw Money
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Money</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (RWF)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to withdraw"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              required
            />
            <p className="text-xs text-muted-foreground">
              Note: Amount will be converted to EUR for sandbox testing
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="250788000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">From Savings Goal (Optional)</Label>
            {goalsLoading ? (
              <div className="text-sm text-muted-foreground">Loading goals...</div>
            ) : (
              <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    availableGoals.length === 0 
                      ? "No goals with savings available" 
                      : "Select a goal or leave empty for general withdrawal"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableGoals.length === 0 ? (
                    <>
                      <SelectItem value="no-goals" disabled>
                        No savings goals with available funds
                      </SelectItem>
                      <SelectItem value="sample-1" disabled>
                        Emergency Fund - RWF 0 available
                      </SelectItem>
                      <SelectItem value="sample-2" disabled>
                        School Fees - RWF 0 available
                      </SelectItem>
                      <SelectItem value="sample-3" disabled>
                        Business Investment - RWF 0 available
                      </SelectItem>
                    </>
                  ) : (
                    availableGoals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.name} - RWF {goal.current_amount?.toLocaleString() || 0} available
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {availableGoals.length === 0 && !goalsLoading && (
              <p className="text-xs text-muted-foreground">
                Create savings goals and save money to see them here
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Reason for withdrawal..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Processing..." : "Submit Withdrawal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
