import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Target, Receipt, DollarSign, Zap, BarChart3, LogOut, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import dashboardIcon from "@/assets/dashboard-icon.png";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const { setOpenMobile } = useSidebar();

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: 'dashboard' },
    { path: '/goals', label: t('goals'), icon: Target },
    { path: '/expenses', label: t('incomeExpenseTracker'), icon: Receipt },
    { path: '/budget', label: 'Budget', icon: DollarSign },
    { path: '/automated-savings', label: 'Auto Savings', icon: Zap },
    { path: '/insights', label: t('insights'), icon: BarChart3 },
    { path: '/settings', label: t('settings'), icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (path: string) => {
    navigate(path);
    setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r border-border bg-card transition-transform duration-300 ease-in-out">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => handleNavClick('/dashboard')}
        >
          <div className="w-10 h-10 bg-gradient-cta rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">I</span>
          </div>
          <span className="text-xl font-bold text-foreground">ISave</span>
        </div>
      </div>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.path)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all min-h-[44px] ${
                        active 
                          ? 'bg-gradient-cta text-white shadow-lg' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {item.icon === 'dashboard' ? (
                        <img src={dashboardIcon} alt="Dashboard" className="w-5 h-5" />
                      ) : (
                        <item.icon size={20} />
                      )}
                      <span className="font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sign Out at bottom */}
        <div className="mt-auto pt-4 px-2 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-primary hover:bg-accent transition-colors min-h-[44px]"
          >
            <LogOut size={20} />
            <span className="font-medium">{t('signOut')}</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
