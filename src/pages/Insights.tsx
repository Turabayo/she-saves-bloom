
import Navigation from "@/components/Navigation";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useInvestmentInsights } from "@/hooks/useInvestmentInsights";
import { formatCurrency } from "@/utils/dateFormatter";
import { TrendingUp } from "lucide-react";

const Insights = () => {
  const { insights, loading } = useInvestmentInsights();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="px-4 pb-20">
          <div className="max-w-md mx-auto">
            <div className="py-6 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading insights...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Insights</h1>
            <p className="text-muted-foreground">Review your investment performance</p>
          </div>

          {!insights.hasData ? (
            /* No Data State */
            <div className="bg-card rounded-xl p-8 text-center shadow-sm">
              <TrendingUp size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No Investment Data Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start investing to see your growth trends and insights here.
              </p>
              <button 
                onClick={() => window.location.href = '/investments'}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
              >
                Add Your First Investment
              </button>
            </div>
          ) : (
            <>
              {/* Net Worth */}
              <div className="bg-card rounded-xl p-6 mb-6 shadow-sm">
                <h2 className="text-lg font-semibold text-card-foreground mb-1">
                  {formatCurrency(insights.totalNetWorth)}
                </h2>
                <p className="text-muted-foreground text-sm">Total Net Worth</p>
              </div>

              {/* Chart */}
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Investment Growth</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={insights.growthData}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `${(value/1000).toFixed(0)}K`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Insights;
