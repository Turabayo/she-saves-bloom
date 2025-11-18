import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Bot, User, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDevice } from "@/hooks/use-device";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/components/ui/sidebar";

const Navigation = () => {
  const navigate = useNavigate();
  const { isNative, isIOS } = useDevice();
  const { toggleSidebar } = useSidebar();

  return (
    <header className={`sticky top-0 bg-card/70 backdrop-blur border-b border-border px-4 sm:px-6 py-3 ${isNative && isIOS ? 'pt-12' : ''}`}>
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="min-h-[44px] min-w-[44px]"
          title="Menu"
        >
          <Menu size={20} />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search..." 
            className="pl-10 bg-surface border-line"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/assistant')}
            className="min-h-[44px] min-w-[44px]"
            title="AI Assistant"
          >
            <Bot size={18} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="min-h-[44px] min-w-[44px]"
            title="Profile"
          >
            <User size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
