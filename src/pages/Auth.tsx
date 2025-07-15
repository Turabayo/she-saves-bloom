
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (!error) {
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName, formData.phone);
        if (!error) {
          // Stay on auth page to show success message
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      phone: ""
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="p-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-foreground">SheSaves</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {isLogin ? 'Welcome back' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Sign in to your account' : 'Join thousands of women building their future'}
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 px-6 pt-8">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <Input
                type="text"
                placeholder="Full name"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full p-4 text-lg border-input rounded-lg"
                required
              />
            )}

            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-4 text-lg border-input rounded-lg"
              required
            />

            {!isLogin && (
              <Input
                type="tel"
                placeholder="Phone number (optional)"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-4 text-lg border-input rounded-lg"
              />
            )}

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={isLogin ? "Password" : "Create password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-4 text-lg border-input rounded-lg pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="text-left">
              <button type="button" className="text-muted-foreground text-sm hover:text-foreground">
                Forgot password?
              </button>
            </div>
          )}

          <Button 
            type="submit"
            disabled={loading}
            className="w-full py-4 text-lg rounded-lg disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign in' : 'Create Account')}
          </Button>

          <div className="text-center pt-4">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button 
              type="button"
              className="text-primary font-medium hover:underline"
              onClick={toggleMode}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Auth;
