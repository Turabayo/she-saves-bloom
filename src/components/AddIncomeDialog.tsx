import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIncome } from "@/hooks/useIncome";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface AddIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddIncomeDialog = ({ open, onOpenChange, onSuccess }: AddIncomeDialogProps) => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addIncome } = useIncome();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !source) return;

    setIsSubmitting(true);
    try {
      await addIncome({
        amount: parseFloat(amount),
        source,
        note: note || undefined,
        date,
      });
      
      // Show success message
      toast({
        title: "Income Added! 💰",
        description: `Successfully added ${parseFloat(amount).toLocaleString()} RWF from ${source}`,
      });
      
      // Reset form
      setAmount("");
      setSource("");
      setNote("");
      setDate(new Date().toISOString().split('T')[0]);
      onOpenChange(false);
      
      // Call success callback to navigate to income tab
      onSuccess?.();
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
          <DialogTitle>{t('addIncome')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="source">{t('source')}</Label>
            <Input
              id="source"
              placeholder={t('incomeSourcePlaceholder')}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">{t('date')}</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">{t('note')} ({t('optional')})</Label>
            <Textarea
              id="note"
              placeholder={t('noteOptional')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
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
              disabled={isSubmitting || !amount || !source}
              className="flex-1"
            >
              {isSubmitting ? t('adding') : t('addIncome')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};