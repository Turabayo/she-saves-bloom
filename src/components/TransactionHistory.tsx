import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader } from "lucide-react";

interface MomoTransaction {
  id: string;
  amount: number;
  currency: string;
  phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<MomoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('momo_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching transactions:', error);
        } else {
          setTransactions(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    // Clean up any existing channel first
    if (channelRef.current) {
      console.log('Cleaning up existing transaction history channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Set up realtime subscription for transaction updates
    const channelName = `transaction-history-${user.id}`;
    console.log('Creating transaction history channel:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'momo_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Transaction updated in history:', payload.new);
          setTransactions(prev => 
            prev.map(t => 
              t.id === payload.new.id 
                ? { ...t, ...payload.new }
                : t
            )
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up transaction history channel:', channelName);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'successful':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Top-ups</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {transaction.amount.toLocaleString()} RWF
                  </span>
                  {getStatusBadge(transaction.status)}
                </div>
                <div className="text-sm text-gray-600">
                  {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {transaction.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;