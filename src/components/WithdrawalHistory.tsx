import { useWithdrawals } from "@/hooks/useWithdrawals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/dateFormatter";
import { Loader2 } from "lucide-react";

export const WithdrawalHistory = () => {
  const { withdrawals, loading } = useWithdrawals();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-primary/20 text-primary border-primary/20">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Withdrawals</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </CardContent>
      </Card>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Withdrawals</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-slate-400">No withdrawals yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur border border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Recent Withdrawals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {withdrawals.slice(0, 5).map((withdrawal) => (
            <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">RWF {withdrawal.amount.toLocaleString()}</span>
                  {getStatusBadge(withdrawal.status)}
                </div>
                {withdrawal.note && (
                  <p className="text-sm text-slate-400">{withdrawal.note}</p>
                )}
                <p className="text-xs text-slate-400">
                  {formatDate(withdrawal.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};