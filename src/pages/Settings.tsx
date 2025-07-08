import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [aiEnabled, setAiEnabled] = useState(true);

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
      title: "AI Assistant " + (newValue ? "Enabled" : "Disabled"),
      description: newValue ? "AI Assistant is now active" : "AI Assistant has been turned off",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export feature coming soon",
      description: "Data export functionality will be available in a future update",
    });
  };

  const handleHelpSupport = () => {
    toast({
      title: "Help & Support",
      description: "Contact support at support@shesaves.app",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Profile */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <span className="text-lg font-medium text-gray-900">Profile</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>

            {/* Settings Options */}
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
              <div className="flex items-center justify-between p-4">
                <span className="text-gray-900">Password</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Edit</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <span className="text-gray-900">AI Assistant</span>
                  <p className="text-sm text-gray-500">Enable financial AI assistance everywhere</p>
                </div>
                <Switch 
                  checked={aiEnabled}
                  onCheckedChange={toggleAi}
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <span className="text-gray-900">Language</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">English</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleExportData}
              >
                Export Savings History
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleHelpSupport}
              >
                Help & Support
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>

            {/* Debug Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-1">Debug Info:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>AI Assistant: {aiEnabled ? 'Enabled' : 'Disabled'}</div>
                <div>Environment: Sandbox</div>
                <div>Version: 1.0.0</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
