
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings, Home, Target, BarChart3, LogOut, Receipt, DollarSign, Zap, Search, Bell, User, Sun, Moon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDevice } from "@/hooks/use-device";
import { useTheme } from "@/contexts/ThemeContext";
import { Input } from "@/components/ui/input";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { isNative, isIOS } = useDevice();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: Home, active: location.pathname === '/dashboard' },
    { path: '/goals', label: t('goals'), icon: Target, active: location.pathname === '/goals' },
    { path: '/expenses', label: t('incomeExpenseTracker'), icon: Receipt, active: location.pathname === '/expenses' },
    { path: '/budget', label: 'Budget', icon: DollarSign, active: location.pathname === '/budget' },
    { path: '/automated-savings', label: 'Auto Savings', icon: Zap, active: location.pathname === '/automated-savings' },
    { path: '/insights', label: t('insights'), icon: BarChart3, active: location.pathname === '/insights' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLogoClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className={`bg-card border-b border-border p-4 ${isNative && isIOS ? 'pt-12' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer flex-shrink-0"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">ISave</span>
          </div>

          {/* Search Bar - Desktop only */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search stocks, indices..." 
                className="pl-10 bg-muted/50 border-border"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )}
            </button>

            {/* Notification Bell */}
            <button 
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
            </button>

            {/* User Profile */}
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Profile & Settings"
            >
              <User className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile with icons */}
      <div className={`fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden ${isNative ? 'pb-safe' : ''}`}>
        <div className="max-w-md mx-auto flex">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 py-3 px-2 text-center text-xs font-medium flex flex-col items-center gap-1 ${
                  item.active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <IconComponent size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navigation;
