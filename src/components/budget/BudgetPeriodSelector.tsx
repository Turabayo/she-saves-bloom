import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BudgetPeriodSelectorProps {
  month: number;
  year: number;
  currency: string;
  onMonthChange: (month: number, year: number) => void;
  onCurrencyChange: (currency: string) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CURRENCIES = ['RWF', 'USD', 'EUR', 'GBP', 'KES', 'UGX', 'TZS'];

export const BudgetPeriodSelector = ({ 
  month, 
  year, 
  currency,
  onMonthChange,
  onCurrencyChange
}: BudgetPeriodSelectorProps) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="text-center mb-8">
      {/* Month Title */}
      <h1 className="text-4xl font-bold text-foreground mb-2">
        {MONTHS[month - 1]}
      </h1>
      <p className="text-muted-foreground text-sm mb-4">BUDGET DASHBOARD</p>

      {/* Period & Currency Selector */}
      <Card className="inline-block">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">BUDGET PERIOD</span>
              <Select
                value={`${month}-${year}`}
                onValueChange={(val) => {
                  const [m, y] = val.split('-').map(Number);
                  onMonthChange(m, y);
                }}
              >
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => 
                    MONTHS.map((monthName, idx) => (
                      <SelectItem key={`${idx + 1}-${y}`} value={`${idx + 1}-${y}`}>
                        {monthName} {y}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-px h-6 bg-border" />
            
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">CURRENCY</span>
              <Select value={currency} onValueChange={onCurrencyChange}>
                <SelectTrigger className="w-[80px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(curr => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
