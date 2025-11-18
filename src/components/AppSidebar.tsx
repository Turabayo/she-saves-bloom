import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Target, Receipt, DollarSign, Zap, BarChart3, LogOut } from "lucide-react";
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
    <Sidebar className="border-r border-border bg-surface transition-transform duration-300 ease-in-out">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => handleNavClick('/dashboard')}
        >
          <div className="w-8 h-8 bg-gradient-cta rounded-lg flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.25)]">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <span className="text-xl font-bold text-foreground">ISave</span>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.path)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                        active 
                          ? 'bg-accent-hover text-foreground font-medium' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {item.icon === 'dashboard' ? (
                        <img src={dashboardIcon} alt="Dashboard" className="w-5 h-5" />
                      ) : (
                        <item.icon size={20} />
                      )}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Sign Out */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-cta text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:brightness-110 transition-all mt-4 min-h-[44px]"
                >
                  <LogOut size={20} />
                  <span>{t('signOut')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
