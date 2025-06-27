
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TopUp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    amount: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);

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

    if (!formData.amount || !formData.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number format (Rwanda format)
    const phoneRegex = /^(\+?25)?(078|072|073|079)\d{7}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid Rwandan phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create transaction record first
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            amount: amount,
            type: 'deposit',
            phone: formData.phone,
            status: 'pending',
            payment_method: 'momo',
            currency: 'RWF',
            description: 'MoMo top-up'
          }
        ])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Call MoMo API through edge function
      const response = await fetch('/api/momo-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          amount: amount,
          phone: formData.phone,
          transactionId: transaction.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment request failed');
      }

      // Update transaction with external reference
      await supabase
        .from('transactions')
        .update({
          external_id: result.externalId,
          reference_id: result.referenceId,
          status: 'processing'
        })
        .eq('id', transaction.id);

      toast({
        title: "Payment request sent!",
        description: "Please check your phone for the MoMo prompt",
      });

      // Reset form
      setFormData({ amount: "", phone: "" });
      
      // Navigate to investments page after a short delay
      setTimeout(() => {
        navigate('/investments');
      }, 3000);

    } catch (error: any) {
      console.error('MoMo payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "Unable to process payment. Please try again.",
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
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900">SheSaves</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign size={32} className="text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Top Up with MoMo</h1>
            <p className="text-gray-600">Add money to your savings using MTN Mobile Money</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Amount (RWF)</label>
              <div className="relative">
                <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="pl-10 py-3 text-lg border border-gray-300 rounded-lg"
                  placeholder="1000"
                  min="100"
                  step="1"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Minimum amount: 100 RWF</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="pl-10 py-3 text-lg border border-gray-300 rounded-lg"
                  placeholder="078xxxxxxx"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Enter your MTN Rwanda number</p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                "Save Now"
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Enter the amount you want to save</li>
              <li>• Enter your MTN MoMo number</li>
              <li>• You'll receive a payment prompt on your phone</li>
              <li>• Complete the payment to add funds to your savings</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopUp;
