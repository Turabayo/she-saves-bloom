
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronRight } from "lucide-react";

const Settings = () => {
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
                <span className="text-gray-900">AI Assistant</span>
                <Switch />
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
              <Button variant="outline" className="w-full justify-start">
                Export Savings History
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Help & Support
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
