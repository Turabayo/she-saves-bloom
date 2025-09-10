import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Smartphone, TrendingUp, PiggyBank, Brain, Target, Shield } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HelpDialog = ({ open, onOpenChange }: HelpDialogProps) => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <PiggyBank className="w-6 h-6 text-primary" />,
      title: "Smart Savings",
      description: "Track and manage your savings goals with intelligent insights."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-secondary" />,
      title: "Investment Tracking",
      description: "Monitor your investments and track performance over time."
    },
    {
      icon: <Brain className="w-6 h-6 text-accent" />,
      title: "AI Assistant",
      description: "Get personalized financial advice and insights powered by AI."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-secondary" />,
      title: "Mobile Money Integration",
      description: "Top up your savings using MTN Mobile Money seamlessly."
    },
    {
      icon: <Target className="w-6 h-6 text-secondary" />,
      title: "Goal Setting",
      description: "Set financial goals and track your progress towards achieving them."
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Secure & Safe",
      description: "Your financial data is protected with bank-level security."
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('helpTitle')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-slate-400 leading-relaxed">
            {t('helpContent')}
          </p>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Key Features:</h3>
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-3 p-3 bg-white/5 backdrop-blur border border-white/10 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{feature.title}</h4>
                    <p className="text-sm text-slate-400 mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-2">Getting Started:</h4>
            <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
              <li>Explore the Dashboard to see your financial overview</li>
              <li>Add your first investment in the Investments section</li>
              <li>Use the Top Up feature to add money via Mobile Money</li>
              <li>Check Insights for personalized financial advice</li>
              <li>Enable the AI Assistant for smart recommendations</li>
            </ol>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-slate-400">
              Need more help? Contact our support team at{' '}
              <a href="mailto:support@isave.app" className="text-primary hover:underline">
                support@isave.app
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};