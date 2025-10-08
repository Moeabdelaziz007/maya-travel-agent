import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(STRIPE_SECRET, {
      apiVersion: "2023-10-16",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { priceId, userProfileId, channel } = await req.json();

    console.log("[Create Subscription] Request:", { priceId, userProfileId, channel });

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userProfileId)
      .single();

    if (profileError || !userProfile) {
      throw new Error("User profile not found");
    }

    // Get or create Stripe customer
    let customerId = userProfile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userProfile.email,
        name: userProfile.full_name,
        metadata: {
          user_profile_id: userProfileId,
          whatsapp_phone: userProfile.whatsapp_phone || "",
          telegram_id: userProfile.telegram_id || "",
        },
      });

      customerId = customer.id;

      // Update user profile with Stripe customer ID
      await supabase
        .from("user_profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userProfileId);

      console.log("[Create Subscription] Created Stripe customer:", customerId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${supabaseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${supabaseUrl}/subscription-cancel`,
      metadata: {
        user_profile_id: userProfileId,
        channel: channel,
      },
    });

    console.log("[Create Subscription] Created checkout session:", session.id);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Create Subscription] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
