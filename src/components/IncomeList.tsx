import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, Filter } from "lucide-react";
import { useIncome } from "@/hooks/useIncome";
import { useLanguage } from "@/contexts/LanguageContext";
import { AddIncomeDialog } from "./AddIncomeDialog";
import { format } from "date-fns";

const INCOME_SOURCES = ['All', 'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];

interface IncomeListProps {
  onIncomeAdded?: () => void;
}

export const IncomeList = ({ onIncomeAdded }: IncomeListProps) => {
  const { income, loading, deleteIncome } = useIncome();
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const filteredIncome = income.filter((item) => {
    const matchesSource = sourceFilter === 'All' || item.source === sourceFilter;
    const matchesDate = !dateFilter || item.date.startsWith(dateFilter);
    return matchesSource && matchesDate;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {t('incomeHistory')}
        </CardTitle>
        
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCOME_SOURCES.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-40"
            placeholder="Filter by month"
          />
          
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t('addIncome')}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>

        {filteredIncome.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {income.length === 0 ? t('noIncomeRecorded') : 'No income matches your filters.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIncome.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Badge variant="secondary">
                      {item.source}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(item.date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <div className="font-semibold text-lg">
                    {formatCurrency(Number(item.amount))}
                  </div>
                  
                  {item.note && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.note}
                    </p>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteIncome(item.id)}
                  className="ml-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

      </CardContent>

      <AddIncomeDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSuccess={onIncomeAdded}
      />
    </Card>
  );
};