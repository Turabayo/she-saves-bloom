import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Bot, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDevice } from "@/hooks/use-device";
import { Input } from "@/components/ui/input";

const Navigation = () => {
  const navigate = useNavigate();
  const { isNative, isIOS } = useDevice();

  return (
    <header className={`sticky top-0 bg-card/70 backdrop-blur border-b border-border px-6 py-3 ${isNative && isIOS ? 'pt-12' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search..." 
            className="pl-10 bg-surface2 border-line"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/assistant')}
            title="AI Assistant"
          >
            <Bot size={18} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
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
