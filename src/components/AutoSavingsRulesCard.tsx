import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, DollarSign, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutoRule {
  id: string;
  name: string;
  type: 'round_up' | 'percentage' | 'fixed_amount' | 'spare_change';
  isActive: boolean;
  value?: number;
  description: string;
}

export const AutoSavingsRulesCard = () => {
  const { toast } = useToast();
  
  const [rules, setRules] = useState<AutoRule[]>([
    {
      id: '1',
      name: 'Round Up Purchases',
      type: 'round_up',
      isActive: false,
      description: 'Round up every purchase to the nearest 1000 RWF and save the difference'
    },
    {
      id: '2',
      name: 'Income Percentage',
      type: 'percentage',
      isActive: false,
      value: 10,
      description: 'Save 10% of all income automatically'
    },
    {
      id: '3',
      name: 'Weekly Fixed Amount',
      type: 'fixed_amount',
      isActive: false,
      value: 5000,
      description: 'Save 5,000 RWF every week automatically'
    },
    {
      id: '4',
      name: 'Spare Change',
      type: 'spare_change',
      isActive: false,
      description: 'Save amounts under 500 RWF from transactions'
    }
  ]);

  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<number>(0);

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
    
    const rule = rules.find(r => r.id === ruleId);
    toast({
      title: rule?.isActive ? "Rule disabled" : "Rule enabled",
      description: rule?.isActive ? "Auto-savings rule has been disabled" : "Auto-savings rule is now active",
    });
  };

  const handleUpdateValue = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, value: tempValue }
        : rule
    ));
    setEditingRule(null);
    toast({
      title: "Rule updated",
      description: "Auto-savings rule has been updated successfully",
    });
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'round_up': return <DollarSign size={20} className="text-primary" />;
      case 'percentage': return <Percent size={20} className="text-secondary" />;
      case 'fixed_amount': return <TrendingUp size={20} className="text-purple-500" />;
      case 'spare_change': return <Brain size={20} className="text-secondary" />;
      default: return <Brain size={20} className="text-primary" />;
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain size={20} className="text-primary" />
          Smart Savings Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              {getRuleIcon(rule.type)}
              <div className="flex-1">
                <div className="font-medium text-white">{rule.name}</div>
                <div className="text-sm text-muted-foreground">{rule.description}</div>
                
                {/* Editable value */}
                {rule.value !== undefined && (
                  <div className="mt-2">
                    {editingRule === rule.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(Number(e.target.value))}
                          className="w-20 h-8"
                        />
                        <span className="text-sm text-muted-foreground">
                          {rule.type === 'percentage' ? '%' : 'RWF'}
                        </span>
                        <Button size="sm" onClick={() => handleUpdateValue(rule.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingRule(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setEditingRule(rule.id);
                          setTempValue(rule.value || 0);
                        }}
                        className="text-xs p-1 h-auto text-primary hover:text-primary/80"
                      >
                        {rule.value} {rule.type === 'percentage' ? '%' : 'RWF'} • Click to edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <Switch
              checked={rule.isActive}
              onCheckedChange={() => handleToggleRule(rule.id)}
            />
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-white/5 backdrop-blur border border-white/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-primary" />
            <span className="text-sm font-medium text-white">Smart Savings Tip</span>
          </div>
          <p className="text-sm text-slate-400">
            Combine multiple rules for maximum savings potential. Start with small amounts and gradually increase as you build the habit.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};