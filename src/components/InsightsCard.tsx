
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { useTransactionInsights } from "@/hooks/useTransactionInsights";

const InsightsCard = () => {
  const { insights, loading } = useTransactionInsights();

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur border border-white/10 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="text-secondary" size={20} />
            Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-white/10 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="bg-white/5 backdrop-blur border border-white/10 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="text-secondary" size={20} />
            Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-center py-4">
            Start saving to see your financial insights here!
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount);
  };

  return (
    <Card className="bg-white/5 backdrop-blur border border-white/10 rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="text-secondary" size={20} />
          Financial Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Savings Growth */}
        <div className="flex justify-between items-center p-3 bg-white/10 backdrop-blur border border-white/10 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary" size={16} />
            <span className="text-sm font-medium text-white">Net Savings</span>
          </div>
          <span className="text-white font-bold">
            {formatCurrency(insights.savingsGrowth)}
          </span>
        </div>

        {/* Monthly Average */}
        <div className="flex justify-between items-center p-3 bg-white/10 backdrop-blur border border-white/10 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="text-secondary" size={16} />
            <span className="text-sm font-medium text-white">Monthly Average</span>
          </div>
          <span className="text-white font-bold">
            {formatCurrency(insights.monthlyAverage)}
          </span>
        </div>

        {/* Total Deposits */}
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur border border-white/10 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-secondary" size={16} />
            <span className="text-sm font-medium text-white">Total Deposits</span>
          </div>
          <span className="text-white font-bold">
            {formatCurrency(insights.totalDeposits)}
          </span>
        </div>

        {/* Top Categories */}
        {insights.topCategories.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <Target size={16} className="text-primary" />
              Top Investment Categories
            </h4>
            {insights.topCategories.slice(0, 3).map((category, index) => (
              <div key={category.category} className="flex justify-between items-center text-sm">
                <span className="text-slate-300">{category.category}</span>
                <span className="font-medium text-white">{formatCurrency(category.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Transaction Count */}
        <div className="text-center pt-2 border-t border-white/10">
          <p className="text-xs text-slate-400">
            Based on {insights.transactionCount} transactions in the last 6 months
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
