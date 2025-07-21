
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Withdrawal {
  id: string;
  user_id: string;
  goal_id: string | null;
  amount: number;
  currency: string;
  external_id: string;
  momo_reference_id: string;
  phone_number: string;
  status: string;
  note: string | null;
  momo_transaction_id: string | null;
  payer_message: string | null;
  payee_note: string | null;
  created_at: string;
  updated_at: string;
}

export const useWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchWithdrawals = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          savings_goals (
            name,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const createWithdrawal = async (withdrawalData: {
    goal_id?: string;
    amount: number;
    phone_number: string;
    note?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    console.log('=== CALLING WITHDRAW-USER FUNCTION ===');
    console.log('Withdrawal data:', withdrawalData);

    // Call the withdraw-user edge function
    const { data, error } = await supabase.functions.invoke('withdraw-user', {
      body: {
        user_id: user.id,
        amount: withdrawalData.amount,
        phone_number: withdrawalData.phone_number
      }
    });

    console.log('Edge function response:', { data, error });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to process withdrawal');
    }

    // Check if the response indicates success or failure
    if (data && !data.success) {
      console.error('Withdrawal failed:', data);
      throw new Error(data.error || 'Withdrawal request failed');
    }

    console.log('✅ Withdrawal processed successfully:', data);
    await fetchWithdrawals(); // Refresh the list
    return data;
  };

  const updateWithdrawalStatus = async (withdrawalId: string, status: string) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('withdrawals')
      .update({ status })
      .eq('id', withdrawalId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    await fetchWithdrawals(); // Refresh the list
    return data;
  };

  const getTotalWithdrawals = () => {
    return withdrawals
      .filter(withdrawal => withdrawal.status === 'completed')
      .reduce((total, withdrawal) => total + withdrawal.amount, 0);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [user]);

  return {
    withdrawals,
    loading,
    createWithdrawal,
    updateWithdrawalStatus,
    getTotalWithdrawals,
    refetch: fetchWithdrawals
  };
};
