
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { useTransactionInsights } from "@/hooks/useTransactionInsights";

const InsightsCard = () => {
  const { insights, loading } = useTransactionInsights();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-secondary" size={20} />
            Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-secondary" size={20} />
            Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-4">
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="text-secondary" size={20} />
          Financial Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Savings Growth */}
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-600" size={16} />
            <span className="text-sm font-medium text-green-800">Net Savings</span>
          </div>
          <span className="text-green-700 font-bold">
            {formatCurrency(insights.savingsGrowth)}
          </span>
        </div>

        {/* Monthly Average */}
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="text-blue-600" size={16} />
            <span className="text-sm font-medium text-blue-800">Monthly Average</span>
          </div>
          <span className="text-blue-700 font-bold">
            {formatCurrency(insights.monthlyAverage)}
          </span>
        </div>

        {/* Total Deposits */}
        <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-secondary" size={16} />
            <span className="text-sm font-medium text-secondary">Total Deposits</span>
          </div>
          <span className="text-secondary font-bold">
            {formatCurrency(insights.totalDeposits)}
          </span>
        </div>

        {/* Top Categories */}
        {insights.topCategories.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Target size={16} />
              Top Investment Categories
            </h4>
            {insights.topCategories.slice(0, 3).map((category, index) => (
              <div key={category.category} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{category.category}</span>
                <span className="font-medium">{formatCurrency(category.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Transaction Count */}
        <div className="text-center pt-2 border-t">
          <p className="text-xs text-gray-500">
            Based on {insights.transactionCount} transactions in the last 6 months
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
