import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Settings as SettingsIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { PasswordChangeDialog } from "@/components/PasswordChangeDialog";
import { LanguageSelector } from "@/components/LanguageSelector";
import { HelpDialog } from "@/components/HelpDialog";
import { exportSavingsHistory } from "@/utils/exportSavingsHistory";

const Settings = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [aiEnabled, setAiEnabled] = useState(true);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  // Enable AI assistant by default and load setting from localStorage
  useEffect(() => {
    const savedSetting = localStorage.getItem("aiAssistant");
    if (savedSetting === null) {
      // Enable by default
      localStorage.setItem("aiAssistant", "true");
      setAiEnabled(true);
    } else {
      setAiEnabled(savedSetting === "true");
    }
  }, []);

  const toggleAi = () => {
    const newValue = !aiEnabled;
    setAiEnabled(newValue);
    localStorage.setItem("aiAssistant", newValue.toString());
    
    toast({
      title: newValue ? t('aiEnabled') : t('aiDisabled'),
      description: newValue ? t('aiEnabledDesc') : t('aiDisabledDesc'),
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('signOutSuccess'),
        description: t('signOutDesc'),
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleExportData = async () => {
    try {
      await exportSavingsHistory();
      toast({
        title: t('exportSuccess'),
        description: "Your savings history has been downloaded successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('exportError'),
        description: "Failed to generate export. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleHelpSupport = () => {
    setHelpDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
          </div>

          <div className="space-y-6">
            {/* Profile */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <SettingsIcon className="text-white" size={20} />
                  </div>
                  <span className="text-lg font-medium text-gray-900">{t('profile')}</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>

            {/* Settings Options */}
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
              <button 
                className="flex items-center justify-between p-4 w-full text-left hover:bg-gray-50 transition-colors"
                onClick={() => setPasswordDialogOpen(true)}
              >
                <span className="text-gray-900">{t('password')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{t('changePassword')}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>

              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <span className="text-gray-900">{t('aiAssistant')}</span>
                  <p className="text-sm text-gray-500">{t('aiAssistantDesc')}</p>
                </div>
                <Switch 
                  checked={aiEnabled}
                  onCheckedChange={toggleAi}
                />
              </div>

              <button 
                className="flex items-center justify-between p-4 w-full text-left hover:bg-gray-50 transition-colors"
                onClick={() => setLanguageDialogOpen(true)}
              >
                <span className="text-gray-900">{t('language')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">
                    {language === 'en' ? t('english') : t('french')}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleExportData}
              >
                {t('exportSavingsHistory')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleHelpSupport}
              >
                {t('helpSupport')}
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                {t('signOut')}
              </Button>
            </div>

          </div>
        </div>
      </main>

      {/* Dialogs */}
      <PasswordChangeDialog 
        open={passwordDialogOpen} 
        onOpenChange={setPasswordDialogOpen} 
      />
      <LanguageSelector 
        open={languageDialogOpen} 
        onOpenChange={setLanguageDialogOpen} 
      />
      <HelpDialog 
        open={helpDialogOpen} 
        onOpenChange={setHelpDialogOpen} 
      />
    </div>
  );
};

export default Settings;
