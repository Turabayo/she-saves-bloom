
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useDevice } from "./hooks/use-device";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import GoalSelection from "./pages/Goals";
import Dashboard from "./pages/Dashboard";
import AddInvestment from "./pages/AddInvestment";
import SavingsDashboard from "./pages/SavingsDashboard";
import Insights from "./pages/Insights";
import Community from "./pages/Community";
import Assistant from "./pages/Assistant";
import Settings from "./pages/Settings";
import TopUp from "./pages/TopUp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isNative } = useDevice();

  return (
    <div className={isNative ? 'min-h-screen bg-background overflow-hidden' : ''}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/goal-selection" element={<GoalSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-goal" element={<AddInvestment />} />
          <Route path="/goals" element={<SavingsDashboard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/community" element={<Community />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/top-up" element={<TopUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
