
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', active: location.pathname === '/dashboard' },
    { path: '/investments', label: 'Investments', active: location.pathname === '/investments' },
    { path: '/insights', label: 'Insights', active: location.pathname === '/insights' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">SheSaves</span>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex gap-6">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`text-sm font-medium ${
                    item.active ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/settings')}
                className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                title="Settings"
              >
                <span className="text-primary-foreground font-bold text-xs">
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'A'}
                </span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="max-w-md mx-auto flex">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 py-3 text-center text-xs font-medium ${
                item.active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navigation;
