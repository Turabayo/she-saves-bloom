
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings, Home, Target, BarChart3, LogOut, Receipt, DollarSign, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDevice } from "@/hooks/use-device";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { isNative, isIOS } = useDevice();

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
      <header className={`bg-[#0F1625] border-b border-white/10 p-4 ${isNative && isIOS ? 'pt-12' : ''}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#D946EF] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="text-xl font-bold text-white">ISave</span>
          </div>
          
          <div className="flex items-center">
            {/* Desktop navigation with improved spacing and icons */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      item.active ? 'text-[#D946EF]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <IconComponent size={16} />
                    {item.label}
                  </button>
                );
              })}
              
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                <LogOut size={16} />
                {t('signOut')}
              </button>
            </nav>
            
            <button 
              onClick={() => navigate('/settings')}
              className="ml-6 w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#D946EF] rounded-full flex items-center justify-center hover:opacity-90 transition-colors"
              title="Settings"
            >
              <Settings size={16} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile with icons */}
      <div className={`fixed bottom-0 left-0 right-0 bg-[#0F1625] border-t border-white/10 md:hidden ${isNative ? 'pb-safe' : ''}`}>
        <div className="max-w-md mx-auto flex">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 py-3 px-2 text-center text-xs font-medium flex flex-col items-center gap-1 ${
                  item.active ? 'text-[#D946EF]' : 'text-slate-400'
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
