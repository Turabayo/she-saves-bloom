import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Calendar } from "lucide-react";
import { useScheduledSavings } from "@/hooks/useScheduledSavings";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateScheduledSavingDialog } from "./CreateScheduledSavingDialog";
import { format } from "date-fns";

export const ScheduledSavingsCard = () => {
  const { scheduledSavings, loading, getUpcomingSavings } = useScheduledSavings();
  const { t } = useLanguage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const upcomingSavings = getUpcomingSavings();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getFrequencyBadgeVariant = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'default';
      case 'monthly': return 'secondary';
      case 'one-time': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('scheduledSavings')}</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('scheduledSavings')}</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {upcomingSavings.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                {t('noScheduledSavings')}
              </p>
              <Button 
                size="sm" 
                onClick={() => setShowCreateDialog(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('createSchedule')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">
                  {upcomingSavings.length}
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('upcomingThisWeek')}
              </p>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {upcomingSavings.slice(0, 3).map((saving) => (
                  <div key={saving.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate">{saving.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={getFrequencyBadgeVariant(saving.frequency)} className="text-xs">
                        {t(saving.frequency)}
                      </Badge>
                      <span className="font-medium">
                        {formatCurrency(Number(saving.amount))}
                      </span>
                    </div>
                  </div>
                ))}
                {upcomingSavings.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{upcomingSavings.length - 3} {t('more')}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateScheduledSavingDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
};