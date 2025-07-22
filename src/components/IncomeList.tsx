import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Plus } from "lucide-react";
import { useIncome } from "@/hooks/useIncome";
import { useLanguage } from "@/contexts/LanguageContext";
import { AddIncomeDialog } from "./AddIncomeDialog";
import { format } from "date-fns";

export const IncomeList = () => {
  const { income, loading, deleteIncome } = useIncome();
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = useState(false);

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t('incomeHistory')}</h3>
        <Button onClick={() => setShowAddDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t('addIncome')}
        </Button>
      </div>

      {income.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{t('noIncomeRecorded')}</p>
            <Button onClick={() => setShowAddDialog(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              {t('addFirstIncome')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {income.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.source}</span>
                      <Badge variant="secondary">
                        {formatCurrency(Number(item.amount))}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.date), 'MMM dd, yyyy')}
                    </p>
                    {item.note && (
                      <p className="text-sm text-muted-foreground">{item.note}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteIncome(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddIncomeDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  );
};