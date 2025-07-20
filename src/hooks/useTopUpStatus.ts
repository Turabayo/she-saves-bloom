import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTopUpStatus = () => {
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  const checkTopUpStatus = async (momoReferenceId: string) => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-topup-status', {
        body: {
          momo_reference_id: momoReferenceId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.status === 'SUCCESSFUL') {
        toast({
          title: "Payment successful!",
          description: "Your top-up has been completed successfully.",
        });
        return true;
      } else if (data?.status === 'FAILED') {
        toast({
          title: "Payment failed",
          description: "Your top-up payment was not successful.",
          variant: "destructive"
        });
        return false;
      }

      // Status is still PENDING
      return null;
    } catch (error: any) {
      console.error('Error checking top-up status:', error);
      toast({
        title: "Error checking status",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setChecking(false);
    }
  };

  return {
    checkTopUpStatus,
    checking
  };
};