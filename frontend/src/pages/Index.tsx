import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plane, Sparkles, MapPin, Brain, CreditCard, Zap, Globe, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mayaBrand from '@/assets/maya-brand.png';
import heroJourney from '@/assets/hero-journey.png';
import heroCompanion from '@/assets/hero-companion.png';
import { HeroMap } from '@/components/HeroMap';
import { AnimatedStats } from '@/components/AnimatedStats';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Redesigned */}
      <section className="relative overflow-hidden min-h-screen flex items-center px-4 py-20">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Left: Text Content */}
            <div className="space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 w-fit">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI-Powered Travel Planning</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="block bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Discover
                </span>
                <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mt-2">
                  Your Journey
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                Meet Maya, your intelligent travel companion. Plan personalized adventures, explore hidden gems, and create unforgettable memories with AI-powered insights.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm">Free to Start</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span className="text-sm">AI-Powered</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span className="text-sm">195+ Countries</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4 flex-wrap">
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-glow text-base px-8 h-14 group">
                    Start Planning Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="glass border-primary/30 hover:border-primary text-base px-8 h-14">
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Map Visualization */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative aspect-square lg:aspect-auto lg:h-[600px]">
                <HeroMap />
                {/* Floating Cards */}
                <div className="absolute -bottom-4 -left-4 glass-card p-4 rounded-xl border border-primary/30 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">10,000+ Destinations</div>
                      <div className="text-xs text-muted-foreground">Worldwide Coverage</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-4 -right-4 glass-card p-4 rounded-xl border border-secondary/30 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">AI-Powered</div>
                      <div className="text-xs text-muted-foreground">Smart Planning</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Stats */}
          <AnimatedStats />

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <Card className="glass-card p-6 hover:shadow-[0_0_60px_rgba(168,85,247,0.3)] transition-all duration-500 hover:-translate-y-2 group">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Planning</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Chat with Maya to get personalized itineraries and travel recommendations tailored to your preferences
              </p>
            </Card>

            <Card className="glass-card p-6 hover:shadow-[0_0_60px_rgba(59,130,246,0.3)] transition-all duration-500 hover:-translate-y-2 group">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Destination</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Plan complex trips with multiple stops and seamless transitions between destinations
              </p>
            </Card>

            <Card className="glass-card p-6 hover:shadow-[0_0_60px_rgba(6,182,212,0.3)] transition-all duration-500 hover:-translate-y-2 group">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Optimize every moment with AI-generated daily itineraries that maximize your experience
              </p>
            </Card>

            <Card className="glass-card p-6 hover:shadow-[0_0_60px_rgba(168,85,247,0.3)] transition-all duration-500 hover:-translate-y-2 group">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Payments</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Secure payment links for bookings and reservations with instant confirmations
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Journey Automated Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/20" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={heroJourney} 
                alt="Your Journey, Automated" 
                className="w-full rounded-2xl shadow-[0_0_80px_rgba(168,85,247,0.4)] hover:shadow-[0_0_100px_rgba(168,85,247,0.6)] transition-all duration-500"
              />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Your Journey, Automated
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Experience the future of travel planning with AI that understands your preferences, budget, and dreams. Maya transforms complex itineraries into seamless adventures.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Globe className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Global Destinations</h3>
                    <p className="text-muted-foreground">Access insights from millions of destinations worldwide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-secondary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Smart Scheduling</h3>
                    <p className="text-muted-foreground">Optimize every moment with AI-powered time management</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Personalized Routes</h3>
                    <p className="text-muted-foreground">Custom itineraries tailored to your travel style</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Companion Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Your Smart Travel Companion Awaits
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Chat with Maya anytime, anywhere. Get instant recommendations, solve travel challenges, and discover hidden gems that match your interests.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Brain className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">AI-Powered Insights</h3>
                    <p className="text-muted-foreground">Get intelligent suggestions based on real-time data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-secondary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Instant Responses</h3>
                    <p className="text-muted-foreground">24/7 availability for all your travel questions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-6 h-6 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Seamless Booking</h3>
                    <p className="text-muted-foreground">Secure payments and instant confirmations</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src={heroCompanion} 
                alt="Your Smart Travel Companion" 
                className="w-full rounded-2xl shadow-[0_0_80px_rgba(59,130,246,0.4)] hover:shadow-[0_0_100px_rgba(59,130,246,0.6)] transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Ready to Explore the World?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of travelers who trust Maya to plan their perfect trips
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-glow">
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
