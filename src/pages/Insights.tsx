
import Navigation from "@/components/Navigation";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const Insights = () => {
  const data = [
    { month: 'Jan', value: 10000 },
    { month: 'Apr', value: 15000 },
    { month: 'Jul', value: 18000 },
    { month: 'Oct', value: 25000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Insights</h1>
            <p className="text-gray-600">Review your investment performance</p>
          </div>

          {/* Net Worth */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">$25,500</h2>
            <p className="text-gray-600 text-sm">Net Worth</p>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Growth</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(value) => `${value/1000}K`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FF5722" 
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;
