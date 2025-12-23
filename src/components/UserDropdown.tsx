import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, User, Lock, LogOut, ChevronDown } from "lucide-react";
import { PasswordChangeDialog } from "@/components/PasswordChangeDialog";

export function UserDropdown() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-card hover:bg-accent transition-colors min-h-[44px]">
            <div className="w-8 h-8 rounded-full bg-gradient-cta flex items-center justify-center">
              <span className="text-white text-sm font-medium">{initials}</span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer py-3">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer py-3">
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)} className="cursor-pointer py-3">
            <Lock className="mr-2 h-4 w-4" />
            <span>Change Password</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleSignOut} 
            className="cursor-pointer py-3 bg-gradient-cta text-white focus:bg-gradient-cta focus:text-white rounded-md mx-1 mb-1"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('signOut')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <PasswordChangeDialog 
        open={passwordDialogOpen} 
        onOpenChange={setPasswordDialogOpen} 
      />
    </>
  );
}
