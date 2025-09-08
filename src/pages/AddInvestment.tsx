
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useToast } from "@/hooks/use-toast";

const AddInvestment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createGoal } = useSavingsGoals();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    note: ""
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    "Car",
    "House",
    "School",
    "Shoes",
    "Dress",
    "Emergency Fund",
    "Education Fund",
    "Business",
    "Travel",
    "Wedding",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name || !formData.amount || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await createGoal({
        name: formData.name,
        goal_amount: parseFloat(formData.amount),
        category: formData.category
      });

      toast({
        title: "Goal added successfully!",
        description: `${formData.name} has been added to your goals.`
      });

      // Reset form
      setFormData({
        name: "",
        amount: "",
        category: "",
        note: ""
      });

      // Navigate back to goals
      navigate('/goals');
    } catch (error: any) {
      console.error('Add investment error:', error);
      toast({
        title: "Error adding goal",
        description: error.message || "Unable to add goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ISave</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Add Goal</h1>
            <Button
              onClick={() => navigate('/top-up')}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white flex items-center gap-2"
            >
              <CreditCard size={16} />
              Top Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Name */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Goal Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="py-3 text-lg border border-gray-300 rounded-lg"
                placeholder="e.g., Emergency Fund"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="pl-8 py-3 text-lg border border-gray-300 rounded-lg"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="py-3 text-lg border border-gray-300 rounded-lg">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Note (optional)</label>
              <Textarea
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                placeholder="Add a note about this goal..."
                className="py-3 text-lg border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-4 text-lg rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                "Add Goal"
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddInvestment;
