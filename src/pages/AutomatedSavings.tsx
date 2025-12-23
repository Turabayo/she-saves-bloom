import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarSpacer } from "@/components/ui/sidebar";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, Target, Zap, Pencil, Trash2 } from "lucide-react";
import { useScheduledSavings, ScheduledSaving } from "@/hooks/useScheduledSavings";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { CreateScheduledSavingDialog } from "@/components/CreateScheduledSavingDialog";
import { formatCurrency, formatDate } from "@/utils/dateFormatter";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/ui/loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AutomatedSavings = () => {
  const { user } = useAuth();
  const { 
    scheduledSavings, 
    loading, 
    updateScheduledSaving, 
    deleteScheduledSaving,
    getUpcomingSavings,
    getActiveRulesCount,
    getMonthlyTotal,
  } = useScheduledSavings();
  const { goals } = useSavingsGoals();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<ScheduledSaving | null>(null);
  const [deletingRule, setDeletingRule] = useState<ScheduledSaving | null>(null);

  const upcomingSavings = getUpcomingSavings();
  const activeRulesCount = getActiveRulesCount();
  const monthlyTotal = getMonthlyTotal();

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateScheduledSaving(id, { is_active: isActive });
      toast({
        title: isActive ? "Rule activated" : "Rule paused",
        description: isActive ? "Your savings rule is now active" : "Your savings rule has been paused",
      });
    } catch (error) {
      console.error('Error updating scheduled saving:', error);
    }
  };

  const handleEdit = (rule: ScheduledSaving) => {
    setEditingRule(rule);
    setShowCreateDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingRule) return;
    try {
      await deleteScheduledSaving(deletingRule.id);
      setDeletingRule(null);
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const handleDialogClose = () => {
    setShowCreateDialog(false);
    setEditingRule(null);
  };

  if (!user) return null;

  if (loading) {
    return <LoadingScreen />;
  }

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'one-time': return 'One-time';
      default: return freq;
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarSpacer />
        <div className="flex-1 flex flex-col min-w-0">
          <Navigation />
          <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Auto Savings</h1>
                <p className="text-muted-foreground">Automate your savings to reach goals effortlessly</p>
              </div>
              <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
                <Plus size={16} className="mr-2" />
                Create Rule
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Zap size={16} className="text-primary" />
                    Active Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {activeRulesCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    Est. Monthly Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(monthlyTotal)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CalendarDays size={16} className="text-primary" />
                    Upcoming (7 days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {upcomingSavings.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scheduled Savings List */}
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground">Your Savings Rules</h2>
              
              {scheduledSavings.length === 0 ? (
                <Card className="p-8 text-center">
                  <Zap size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No savings rules yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first rule to start saving automatically</p>
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
                      <Card key={saving.id} className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <h3 className="text-lg font-semibold text-foreground truncate">{saving.name}</h3>
                              <Badge variant={saving.is_active ? "default" : "secondary"}>
                                {saving.is_active ? "Active" : "Paused"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getFrequencyLabel(saving.frequency)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {relatedGoal ? `→ ${relatedGoal.name}` : "General Savings"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right">
                              <div className="text-lg font-semibold text-foreground">
                                {formatCurrency(saving.amount)}
                              </div>
                              <div className="text-xs text-muted-foreground">per {saving.frequency.replace('-', ' ')}</div>
                            </div>
                            <Switch
                              checked={saving.is_active}
                              onCheckedChange={(checked) => handleToggleActive(saving.id, checked)}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-border">
                          <div className="flex gap-6 text-sm">
                            <div>
                              <span className="text-muted-foreground">Next run: </span>
                              <span className="font-medium text-foreground">{formatDate(saving.next_execution_date)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Created: </span>
                              <span className="font-medium text-foreground">{formatDate(saving.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(saving)}
                              className="flex-1 sm:flex-none"
                            >
                              <Pencil size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingRule(saving)}
                              className="flex-1 sm:flex-none text-destructive hover:text-destructive"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </Button>
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
                  Upcoming (Next 7 Days)
                </h3>
                <div className="space-y-3">
                  {upcomingSavings.map((saving) => {
                    const relatedGoal = goals.find(goal => goal.id === saving.goal_id);
                    return (
                      <div key={saving.id} className="flex justify-between items-center p-3 bg-muted rounded-xl">
                        <div>
                          <div className="font-medium text-foreground">{saving.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {relatedGoal ? relatedGoal.name : "General Savings"}
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
              onOpenChange={handleDialogClose}
              editingRule={editingRule}
              onSuccess={() => {
                handleDialogClose();
                toast({
                  title: editingRule ? "Rule updated" : "Rule created",
                  description: editingRule 
                    ? "Your savings rule has been updated" 
                    : "Your savings rule has been created successfully",
                });
              }}
            />

            <AlertDialog open={!!deletingRule} onOpenChange={() => setDeletingRule(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Savings Rule</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{deletingRule?.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AutomatedSavings;
