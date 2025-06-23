
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";

const AddInvestment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: "",
    note: ""
  });

  const categories = [
    "Emergency Fund",
    "Education Fund", 
    "Small Business",
    "Retirement Fund",
    "Home Purchase",
    "Other"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add investment logic here
    console.log('Investment added:', formData);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900">SheSaves</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Investment</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Date */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Date</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="py-3 text-lg border border-gray-300 rounded-lg pr-10"
                  required
                />
                <Calendar size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Note (optional)</label>
              <Textarea
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                placeholder="Add a note about this investment..."
                className="py-3 text-lg border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg rounded-lg"
            >
              Add
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddInvestment;
