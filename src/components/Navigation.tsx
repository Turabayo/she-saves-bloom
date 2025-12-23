import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Bot, Menu, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDevice } from "@/hooks/use-device";
import { Input } from "@/components/ui/input";
import { useSidebarOptional } from "@/components/ui/sidebar";
import { UserDropdown } from "@/components/UserDropdown";

const Navigation = () => {
  const navigate = useNavigate();
  const { isNative, isIOS } = useDevice();
  const sidebarContext = useSidebarOptional();

  return (
    <header className={`sticky top-0 bg-card/80 backdrop-blur-sm border-b border-border px-4 sm:px-6 py-3 z-30 ${isNative && isIOS ? 'pt-12' : ''}`}>
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Menu trigger - only show if sidebar context exists */}
        {sidebarContext && (
          <Button
            variant="ghost"
            size="icon"
            onClick={sidebarContext.toggleSidebar}
            className="min-h-[44px] min-w-[44px]"
            title="Menu"
          >
            <Menu size={20} />
          </Button>
        )}

        {/* Search */}
        <div className="flex-1 max-w-md relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search..." 
            className="pl-10 bg-background border-border rounded-full h-10"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          
          <Button
            variant="ghost"
            size="icon"
            className="min-h-[44px] min-w-[44px] relative"
            title="Notifications"
          >
            <Bell size={18} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/assistant')}
            className="min-h-[44px] min-w-[44px]"
            title="AI Assistant"
          >
            <Bot size={18} />
          </Button>

          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Navigation;
