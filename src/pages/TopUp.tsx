
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, DollarSign, RefreshCw } from "lucide-react";
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
    saveSessionData,
    isTokenValid,
    refreshSessionIfNeeded
  } = useMomoSession();
  
  const [loading, setLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'valid' | 'invalid' | 'checking'>('checking');

  // Check session status on mount
  useEffect(() => {
    const checkSession = async () => {
      const valid = await refreshSessionIfNeeded();
      setSessionStatus(valid ? 'valid' : 'invalid');
      
      // Initialize session data for sandbox
      if (!sessionData.environment) {
        saveSessionData({
          environment: 'sandbox',
          subscriptionKey: 'e088d79cb68442d6b631a1783d1fd5be',
          accessToken: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSMjU2In0...',
          apiUserId: '780c177b-fdcf-4c9f-8a51-499ee395574f'
        });
      }
    };

    checkSession();
  }, []);

  const handleFormChange = (field: 'amount' | 'phone', value: string) => {
    const updatedForm = { ...formData, [field]: value };
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

    // Validate phone number format (Rwanda format or test number)
    const phoneRegex = /^(\+?25)?(078|072|073|079)\d{7}$|^46733123454$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid Rwandan phone number or use test number 46733123454",
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

    // Check session validity before proceeding
    const sessionValid = await refreshSessionIfNeeded();
    if (!sessionValid && sessionData.environment === 'production') {
      toast({
        title: "Session expired",
        description: "Please refresh your session and try again",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);

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
            currency: 'EUR', // EUR for sandbox
            description: 'MoMo top-up'
          }
        ])
        .select()
        .single();

      if (transactionError) throw transactionError;

      console.log('Calling MoMo edge function with:', {
        amount,
        phone: formData.phone,
        transactionId: transaction.id
      });

      // Call MoMo API through edge function
      const { data, error } = await supabase.functions.invoke('momo-payment', {
        body: {
          amount: amount,
          phone: formData.phone,
          transactionId: transaction.id
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

      // Save successful form submission
      saveFormData(formData);

      toast({
        title: "Payment request sent!",
        description: `Reference ID: ${data.referenceId}. Check your phone for the MoMo prompt.`,
      });

      // Navigate to investments page after a short delay
      setTimeout(() => {
        navigate('/investments');
      }, 3000);

    } catch (error: any) {
      console.error('MoMo payment error:', error);
      
      let errorMessage = "Unable to process payment. Please try again.";
      
      if (error.message) {
        if (error.message.includes('FunctionsHttpError')) {
          errorMessage = "Payment service is currently unavailable. Please try again later.";
        } else if (error.message.includes('Invalid phone number')) {
          errorMessage = "Please enter a valid phone number.";
        } else if (error.message.includes('expired')) {
          errorMessage = "Session expired. Please refresh the page and try again.";
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

  const handleRefreshSession = async () => {
    setSessionStatus('checking');
    const valid = await refreshSessionIfNeeded();
    setSessionStatus(valid ? 'valid' : 'invalid');
    
    toast({
      title: valid ? "Session refreshed" : "Session refresh failed",
      description: valid ? "Your session has been updated" : "Please check your connection",
      variant: valid ? "default" : "destructive"
    });
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
        {/* Session Status Indicator */}
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            sessionStatus === 'valid' ? 'bg-green-500' : 
            sessionStatus === 'invalid' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            {sessionStatus === 'valid' ? 'Session Active' : 
             sessionStatus === 'invalid' ? 'Session Expired' : 'Checking...'}
          </span>
          <button 
            onClick={handleRefreshSession}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={sessionStatus === 'checking'}
          >
            <RefreshCw size={16} className={`text-gray-600 ${sessionStatus === 'checking' ? 'animate-spin' : ''}`} />
          </button>
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
            <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
              Environment: {sessionData.environment || 'sandbox'} mode
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Amount (EUR - Sandbox)</label>
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
              <p className="text-sm text-gray-500 mt-1">Minimum amount: 1 EUR (Sandbox mode)</p>
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
                  placeholder="46733123454"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Use test number: 46733123454 (or your MTN Rwanda number)
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={loading || sessionStatus === 'invalid'}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : sessionStatus === 'invalid' ? (
                "Session Expired - Refresh Required"
              ) : (
                "Save Now"
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">How it works (Sandbox Mode):</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Form values are saved automatically and restored on page reload</li>
              <li>• Enter the amount you want to save (in EUR for sandbox)</li>
              <li>• Use test number 46733123454 or your MTN MoMo number</li>
              <li>• You'll receive a payment prompt on your phone</li>
              <li>• Complete the payment to add funds to your savings</li>
              <li>• Payment status will be updated automatically via webhook</li>
            </ul>
          </div>

          {/* Session Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-1">Session Info:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Environment: {sessionData.environment || 'sandbox'}</div>
              <div>Token Valid: {isTokenValid() ? 'Yes' : 'No'}</div>
              <div>Last Updated: {sessionData.lastUpdated ? new Date(sessionData.lastUpdated).toLocaleString() : 'Never'}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopUp;
