
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMomoSession } from "@/hooks/useMomoSession";

const TopUp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    formData,
    saveFormData,
    sessionData,
    saveSessionData
  } = useMomoSession();
  
  const [loading, setLoading] = useState(false);

  // Auto-load form values from localStorage on mount
  useEffect(() => {
    const savedAmount = localStorage.getItem("topupAmount") || "10";
    const savedPhone = localStorage.getItem("topupPhone") || "0780000000";
    
    saveFormData({
      amount: savedAmount,
      phone: savedPhone
    });

    // Auto-enable assistant
    localStorage.setItem("aiAssistant", "true");

    // Initialize session data for sandbox with token expiry tracking
    if (!sessionData.environment) {
      const tokenExpiry = "1752097269883"; // Provided token expiry
      localStorage.setItem("tokenExpiry", tokenExpiry);
      
      saveSessionData({
        environment: 'sandbox',
        subscriptionKey: 'e088d79cb68442d6b631a1783d1fd5be',
        accessToken: localStorage.getItem("accessToken") || 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSMjU2In0...',
        apiUserId: '780c177b-fdcf-4c9f-8a51-499ee395574f',
        tokenExpiry: parseInt(tokenExpiry)
      });
    }
  }, []);

  // Auto-save on form changes with sanitization
  const handleFormChange = (field: 'amount' | 'phone', value: string) => {
    let processedValue = value;
    
    if (field === 'phone') {
      // Sanitize phone input: remove spaces, +, and 250
      processedValue = value.replace(/[\s+]/g, '').replace(/^250/, '');
      localStorage.setItem("topupPhone", processedValue);
    } else {
      localStorage.setItem("topupAmount", value);
    }
    
    const updatedForm = { ...formData, [field]: processedValue };
    saveFormData(updatedForm);
  };

  const validateInputs = () => {
    if (!formData.amount || !formData.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

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

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);

      console.log('Calling request-to-pay edge function with:', {
        user_id: user.id,
        amount,
        phone_number: formData.phone
      });

      // Call new request-to-pay edge function
      const { data, error } = await supabase.functions.invoke('request-to-pay', {
        body: {
          user_id: user.id,
          amount: amount,
          phone_number: formData.phone
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Payment service error: ${error.message}`);
      }

      if (!data || !data.success) {
        const errorMessage = data?.error || 'Payment request failed - unknown error';
        console.error('Payment failed:', errorMessage);
        throw new Error(errorMessage);
      }

      toast({
        title: "Payment request sent!",
        description: `Reference ID: ${data.referenceId}. Check your phone for the MoMo prompt.`,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error: any) {
      console.error('MoMo payment error:', error);
      
      let errorMessage = "Unable to process payment. Please try again.";
      
      if (error.message) {
        if (error.message.includes('FunctionsHttpError')) {
          errorMessage = "Payment service is currently unavailable. Please try again later.";
        } else if (error.message.includes('Invalid phone number')) {
          errorMessage = "Please enter a valid phone number.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Payment failed",
        description: errorMessage,
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
                  onChange={(e) => handleFormChange('amount', e.target.value)}
                  className="pl-10 py-3 text-lg border border-gray-300 rounded-lg"
                  placeholder="10"
                  min="1"
                  step="1"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Minimum amount: 1 RWF</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="pl-10 py-3 text-lg border border-gray-300 rounded-lg"
                  placeholder="0780000000"
                  required
                />
              </div>
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
              <li>• Form values are saved automatically and restored on page reload</li>
              <li>• Enter the amount you want to save (in RWF)</li>
              <li>• Complete the payment to add funds to your savings</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopUp;
