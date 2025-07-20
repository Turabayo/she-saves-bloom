import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { useMomoTransactions } from "@/hooks/useMomoTransactions";

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
  const { transactions, loading } = useMomoTransactions();

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
          {transactions.slice(0, 5).map((transaction) => (
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