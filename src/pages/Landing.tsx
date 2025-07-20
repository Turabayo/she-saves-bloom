import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Target, Shield, TrendingUp, Users, Phone, CreditCard, Smartphone, CheckCircle } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Smart Savings Goals",
      description: "Set and track goals for cars, houses, education, and more with intelligent progress tracking."
    },
    {
      icon: Shield,
      title: "Secure Mobile Payments",
      description: "Safe and reliable mobile money transactions with real-time SMS notifications."
    },
    {
      icon: TrendingUp,
      title: "Financial Insights",
      description: "Get detailed analytics and insights about your spending and saving patterns."
    },
    {
      icon: Users,
      title: "Built for Women",
      description: "Designed specifically to empower women's financial independence and growth."
    }
  ];

  const benefits = [
    "Track multiple savings goals",
    "Mobile money integration", 
    "Real-time SMS notifications",
    "Detailed financial analytics",
    "Secure withdrawal system",
    "Progress tracking & insights"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-50">
      {/* Header */}
      <header className="p-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-2xl">S</span>
            </div>
            <span className="text-3xl font-bold text-foreground">SheSaves</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </button>
            <Button onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Financial Empowerment for 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> Women</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Save smart, invest wisely, and build your financial future with SheSaves. 
              Track savings goals, make secure mobile payments, and get instant SMS notifications 
              for all your transactions. Start your journey to financial independence today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate('/auth')}
              >
                <Smartphone className="w-5 h-5 mr-2" />
                Start Saving Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose SheSaves?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for women who want to take control of their financial future
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Everything You Need to Save Successfully
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                SheSaves provides all the tools you need to reach your financial goals, 
                from tracking savings for your dream car to planning for your children's education.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Phone className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    SMS Notifications
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Get instant notifications when you reach your savings goals or complete transactions
                  </p>
                  <div className="bg-background p-4 rounded-lg shadow-inner">
                    <p className="text-sm text-muted-foreground italic">
                      "🎉 Congratulations! You've reached your car savings goal. 
                      You can now buy your dream car!"
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Money Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Mobile Money Made Simple
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Seamlessly integrate with your mobile money provider for easy top-ups and withdrawals. 
            Track all your transactions with detailed analytics and insights.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Easy Top-ups</h3>
              <p className="text-muted-foreground">
                Add money to your savings goals with simple mobile money transfers
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Instant Notifications</h3>
              <p className="text-muted-foreground">
                Receive SMS alerts for all transactions and goal achievements
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Track your progress with detailed charts and financial insights
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Take Control of Your Financial Future?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of women who are building their financial independence with SheSaves
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/auth')}
            >
              Create Your Account
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-muted border-t">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">SheSaves</span>
          </div>
          <p className="text-muted-foreground">
            Empowering women through financial independence
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            © 2024 SheSaves. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;