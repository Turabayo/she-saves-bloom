
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MomoSessionRequest {
  amount: number;
  phoneNumber: string;
  goalId?: string;
}

export const useMomoSession = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const initiatePayment = async ({ amount, phoneNumber, goalId }: MomoSessionRequest) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a payment",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('=== INITIATING MOMO PAYMENT ===');
      console.log('Request data:', { amount, phoneNumber, goalId, userId: user.id });

      const { data, error } = await supabase.functions.invoke('request-to-pay', {
        body: {
          amount,
          phoneNumber,
          userId: user.id,
          goalId
        }
      });

      if (error) {
        console.error('Payment initiation error:', error);
        throw new Error(error.message || 'Failed to initiate payment');
      }

      console.log('✅ Payment initiated successfully:', data);

      // Show success message
      toast({
        title: "Payment initiated",
        description: `Please check your phone (${phoneNumber}) for the MoMo prompt to complete the payment of ${amount} RWF.`,
      });

      // Send SMS notification for payment initiation
      try {
        console.log('📱 Sending payment initiation SMS...');
        
        const smsMessage = `🔔 SheSaves payment request: Please check your phone for a MoMo prompt to pay ${amount} RWF. Complete the payment to add funds to your savings.`;
        
        const smsResponse = await supabase.functions.invoke('send-sms', {
          body: {
            phoneNumber: phoneNumber,
            message: smsMessage,
          }
        });

        if (smsResponse.error) {
          console.error('SMS notification failed:', smsResponse.error);
        } else {
          console.log('✅ Payment initiation SMS sent successfully');
        }
      } catch (smsError) {
        console.error('❌ Error sending payment initiation SMS:', smsError);
        // Don't fail the payment for SMS errors
      }

      return data;
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast({
        title: "Payment failed",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    initiatePayment,
    loading
  };
};
