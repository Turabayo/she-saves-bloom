import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, Target, Zap, Settings2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useScheduledSavings } from "@/hooks/useScheduledSavings";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { CreateScheduledSavingDialog } from "@/components/CreateScheduledSavingDialog";
import { AutoSavingsRulesCard } from "@/components/AutoSavingsRulesCard";
import { formatCurrency, formatDate } from "@/utils/dateFormatter";
import { useToast } from "@/hooks/use-toast";

const AutomatedSavings = () => {
  const { user } = useAuth();
  const { scheduledSavings, updateScheduledSaving, getUpcomingSavings } = useScheduledSavings();
  const { goals } = useSavingsGoals();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const upcomingSavings = getUpcomingSavings();
  const totalAutomatedAmount = scheduledSavings
    .filter(saving => saving.is_active)
    .reduce((total, saving) => total + saving.amount, 0);

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateScheduledSaving(id, { is_active: isActive });
      toast({
        title: isActive ? "Automation enabled" : "Automation paused",
        description: isActive ? "Your scheduled saving is now active" : "Your scheduled saving has been paused",
      });
    } catch (error) {
      console.error('Error updating scheduled saving:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pb-20 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Automated Savings</h1>
            <p className="text-muted-foreground">Set up automatic savings to reach your goals effortlessly</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus size={16} className="mr-2" />
            Create Rule
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap size={16} className="text-primary" />
                  Active Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {scheduledSavings.filter(s => s.is_active).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target size={16} className="text-primary" />
                  Monthly Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalAutomatedAmount)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CalendarDays size={16} className="text-primary" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {upcomingSavings.length}
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Auto Savings Rules */}
        <AutoSavingsRulesCard />

        {/* Scheduled Savings */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground">Your Savings Rules</h2>
          
          {scheduledSavings.length === 0 ? (
            <Card className="p-8 text-center">
              <Zap size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">No automated savings yet</h3>
              <p className="text-muted-foreground mb-4">Create your first automated savings rule to start building wealth effortlessly</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus size={16} className="mr-2" />
                Create Your First Rule
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {scheduledSavings.map((saving) => {
                const relatedGoal = goals.find(goal => goal.id === saving.goal_id);
                return (
                  <Card key={saving.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{saving.name}</h3>
                          <Badge variant={saving.is_active ? "default" : "secondary"}>
                            {saving.is_active ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {relatedGoal ? `Saving for: ${relatedGoal.name}` : "General savings"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Amount</div>
                          <div className="text-lg font-semibold text-foreground">
                            {formatCurrency(saving.amount)}
                          </div>
                        </div>
                        <Switch
                          checked={saving.is_active}
                          onCheckedChange={(checked) => handleToggleActive(saving.id, checked)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Frequency:</span>
                        <div className="font-medium text-foreground capitalize">{saving.frequency}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next execution:</span>
                        <div className="font-medium text-foreground">{formatDate(saving.next_execution_date)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <div className="font-medium text-foreground">{formatDate(saving.created_at)}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Executions */}
        {upcomingSavings.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CalendarDays size={20} className="text-primary" />
              Upcoming Savings (Next 7 Days)
            </h3>
            <div className="space-y-3">
              {upcomingSavings.map((saving) => {
                const relatedGoal = goals.find(goal => goal.id === saving.goal_id);
                return (
                  <div key={saving.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">{saving.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {relatedGoal ? relatedGoal.name : "General savings"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{formatCurrency(saving.amount)}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(saving.next_execution_date)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <CreateScheduledSavingDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false);
            toast({
              title: "Automation created",
              description: "Your automated savings rule has been created successfully",
            });
          }}
        />
      </main>
    </div>
  );
};

export default AutomatedSavings;