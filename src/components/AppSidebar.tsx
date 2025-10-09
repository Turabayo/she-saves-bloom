import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Target, Receipt, DollarSign, Zap, BarChart3, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: Home },
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

  return (
    <Sidebar className="border-r border-border bg-card">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/dashboard')}
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
                const IconComponent = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active 
                          ? 'bg-accent-hover text-foreground font-medium' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <IconComponent size={20} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Sign Out */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-4"
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
