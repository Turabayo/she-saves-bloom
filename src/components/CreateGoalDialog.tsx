import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CreateGoalDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const goalCategories = [
  { value: 'Car', label: '🚗 Car', description: 'Save for your dream car' },
  { value: 'House', label: '🏠 House', description: 'Build your home fund' },
  { value: 'School', label: '🎓 School', description: 'Education expenses' },
  { value: 'Shoes', label: '👟 Shoes', description: 'New footwear' },
  { value: 'Dress', label: '👗 Dress', description: 'Fashion & clothing' },
  { value: 'Travel', label: '✈️ Travel', description: 'Vacation & trips' },
  { value: 'Electronics', label: '📱 Electronics', description: 'Gadgets & tech' },
  { value: 'Emergency', label: '🆘 Emergency', description: 'Emergency fund' },
  { value: 'Investment', label: '📈 Investment', description: 'Future investments' },
];

export const CreateGoalDialog = ({ trigger, onSuccess }: CreateGoalDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    goal_amount: ''
  });
  
  const { createGoal } = useSavingsGoals();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.goal_amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.goal_amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid goal amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      await createGoal({
        name: formData.name,
        category: formData.category,
        goal_amount: amount
      });

      toast({
        title: "Goal Created! 🎯",
        description: `Your ${formData.name} goal has been created successfully`,
      });

      // Reset form and close dialog
      setFormData({ name: '', category: '', goal_amount: '' });
      setOpen(false);
      
      // Call onSuccess callback or navigate to goals
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to savings dashboard to see the updated goals
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = goalCategories.find(cat => cat.value === formData.category);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Create New Savings Goal 🎯
          </DialogTitle>
          <DialogDescription className="text-center">
            Set a target amount and start saving towards your dream!
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              placeholder="e.g., New iPhone, Dream Vacation..."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {goalCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex flex-col">
                      <span>{category.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {category.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory && (
              <p className="text-xs text-muted-foreground">
                {selectedCategory.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Target Amount (RWF)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={formData.goal_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, goal_amount: e.target.value }))}
              disabled={loading}
              min="0"
              step="100"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 gradient-primary hover:opacity-90"
            >
              {loading ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};