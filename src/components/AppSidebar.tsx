import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Target, Receipt, Wallet, Zap, BarChart3, LogOut, Settings, LayoutDashboard } from "lucide-react";
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

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const { setOpenMobile, isMobile, isHovered, open } = useSidebar();

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/goals', label: t('goals'), icon: Target },
    { path: '/expenses', label: 'Tracker', icon: Receipt },
    { path: '/budget', label: 'Budget', icon: Wallet },
    { path: '/automated-savings', label: 'Auto Save', icon: Zap },
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
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Determine if sidebar is expanded (for desktop hover behavior)
  const isExpanded = isMobile || open || isHovered;

  return (
    <Sidebar className="border-r border-border bg-card">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => handleNavClick('/dashboard')}
        >
          <div className="w-10 h-10 bg-gradient-cta rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <span className="text-white font-bold text-lg">I</span>
          </div>
          <span className={`text-xl font-bold text-foreground whitespace-nowrap transition-all duration-200 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            ISave
          </span>
        </div>
      </div>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.path)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all min-h-[44px] w-full ${
                        active 
                          ? 'bg-gradient-cta text-white shadow-lg' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                      tooltip={!isExpanded ? item.label : undefined}
                    >
                      <IconComponent size={20} strokeWidth={1.75} className="shrink-0" />
                      <span className={`font-medium truncate transition-all duration-200 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sign Out at bottom */}
        <div className="mt-auto pt-2 border-t border-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all min-h-[44px] w-full"
                tooltip={!isExpanded ? t('signOut') : undefined}
              >
                <LogOut size={20} strokeWidth={1.75} className="shrink-0" />
                <span className={`font-medium truncate transition-all duration-200 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                  {t('signOut')}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
