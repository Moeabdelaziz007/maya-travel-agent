import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Zap, Shield, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Subscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please sign in to manage subscriptions");
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      // Create profile for authenticated user
      const { data: newProfile } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name,
        })
        .select()
        .single();
      
      setUserProfile(newProfile);
    } else {
      setUserProfile(profile);
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (!userProfile) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      // Get Stripe price ID based on tier
      const priceIds: Record<string, string> = {
        monthly: "price_REPLACE_WITH_YOUR_MONTHLY_PRICE_ID", // Replace with actual Stripe price ID
        yearly: "price_REPLACE_WITH_YOUR_YEARLY_PRICE_ID", // Replace with actual Stripe price ID
      };

      const { data, error } = await supabase.functions.invoke("create-subscription", {
        body: {
          priceId: priceIds[tier],
          userProfileId: userProfile.id,
          channel: "web",
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Sparkles, text: "Unlimited AI travel planning & chat" },
    { icon: TrendingUp, text: "Real-time price alerts for flights & hotels" },
    { icon: Zap, text: "Personalized itineraries based on your preferences" },
    { icon: Shield, text: "Priority customer support" },
    { icon: Check, text: "Exclusive travel deals & recommendations" },
    { icon: Check, text: "Multi-destination trip planning" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Unlock Premium Travel Planning
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of travelers getting personalized AI-powered trip planning
          </p>
        </div>

        {/* Current Status */}
        {userProfile && (
          <div className="max-w-xl mx-auto mb-12">
            <Card className="p-6 bg-muted/50 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-2xl font-bold capitalize">
                    {userProfile.subscription_tier || "Free Trial"}
                  </p>
                  {userProfile.subscription_status === "trial" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {userProfile.trial_messages_used}/{userProfile.trial_messages_limit} messages used
                    </p>
                  )}
                </div>
                {userProfile.subscription_status === "active" && (
                  <Check className="w-12 h-12 text-green-500" />
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Monthly Plan */}
          <Card className="p-8 hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Premium Monthly</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Billed monthly, cancel anytime</p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <feature.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature.text}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSubscribe("monthly")}
              disabled={loading || userProfile?.subscription_status === "active"}
              className="w-full h-12 text-lg"
            >
              {loading ? "Loading..." : userProfile?.subscription_status === "active" ? "Active" : "Subscribe Monthly"}
            </Button>
          </Card>

          {/* Yearly Plan - Best Value */}
          <Card className="p-8 hover:shadow-2xl transition-all duration-300 border-2 border-primary relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">
              SAVE 20%
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Premium Yearly</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold">$95.99</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="text-sm text-green-600 font-semibold mt-2">Save $24/year</p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <feature.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature.text}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSubscribe("yearly")}
              disabled={loading || userProfile?.subscription_status === "active"}
              className="w-full h-12 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {loading ? "Loading..." : userProfile?.subscription_status === "active" ? "Active" : "Subscribe Yearly"}
            </Button>
          </Card>
        </div>

        {/* FAQ / Trust Signals */}
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-4">
            🔒 Secure payment via Stripe • Cancel anytime • 30-day money-back guarantee
          </p>
          <Button variant="ghost" onClick={() => navigate("/")}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
