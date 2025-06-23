
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple navigation to dashboard for demo
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="p-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">SheSaves</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 px-6 pt-8">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-4 text-lg border border-gray-300 rounded-lg"
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="text-left">
            <button type="button" className="text-gray-600 text-sm">
              Forgot password?
            </button>
          </div>

          <Button 
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg rounded-lg"
          >
            Sign in
          </Button>

          <div className="text-center pt-4">
            <span className="text-gray-600">Don't have an account? </span>
            <button 
              type="button"
              className="text-orange-500 font-medium"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Login;
