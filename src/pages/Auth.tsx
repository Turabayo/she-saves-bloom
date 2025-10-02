import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Facebook, Twitter } from "lucide-react";
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
    <div className="min-h-screen bg-[url('/images/auth-bg.jpg')] bg-cover bg-center relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl overflow-hidden lg:rounded-3xl">
            {/* Dark Header */}
            <div className="bg-primary px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I</span>
                </div>
                <h1 className="text-white text-lg font-semibold">
                  {isLogin ? 'Sign in' : 'Create your account'}
                </h1>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6">
              <p className="text-slate-400 text-sm mb-6">
                {isLogin 
                  ? 'Enter your email and password to continue.' 
                  : 'Track income, expenses, and goals with ISave.'
                }
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="First Name.."
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pl-12 text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                      required
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                )}

                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Email.."
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pl-12 text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>

                {!isLogin && (
                  <Input
                    type="tel"
                    placeholder="Phone number (optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  />
                )}

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pl-12 pr-12 text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {isLogin && (
                  <div className="text-right">
                    <button type="button" className="text-white text-sm hover:text-slate-300 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-primary text-white font-semibold shadow-lg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50 mt-6"
                >
                  {loading ? 'Loading...' : (isLogin ? 'LET\'S GO' : 'CREATE ACCOUNT')}
                </Button>
              </form>

              <div className="text-center mt-6">
                <span className="text-slate-400 text-sm">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button 
                  type="button"
                  className="text-white font-medium hover:text-slate-300 transition-colors"
                  onClick={toggleMode}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Secure personal wallet for tracking your financial goals
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;