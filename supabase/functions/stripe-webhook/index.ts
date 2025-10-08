import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

serve(async (req) => {
  try {
    const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!STRIPE_SECRET || !STRIPE_WEBHOOK_SECRET) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(STRIPE_SECRET, {
      apiVersion: "2023-10-16",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No stripe signature");
    }

    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    console.log("[Stripe Webhook] Event type:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userProfileId = session.metadata?.user_profile_id;

        if (!userProfileId) {
          console.error("[Stripe Webhook] No user_profile_id in metadata");
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Update user profile
        await supabase
          .from("user_profiles")
          .update({
            subscription_status: "active",
            subscription_tier: "premium",
            stripe_subscription_id: subscription.id,
            subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("id", userProfileId);

        // Record transaction
        await supabase
          .from("payment_transactions")
          .insert({
            user_profile_id: userProfileId,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || "usd",
            status: "completed",
            description: "Premium subscription",
          });

        console.log("[Stripe Webhook] ✅ Subscription activated for user:", userProfileId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const { data: userProfile } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userProfile) {
          await supabase
            .from("user_profiles")
            .update({
              subscription_status: subscription.status === "active" ? "active" : "cancelled",
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("id", userProfile.id);

          console.log("[Stripe Webhook] ✅ Subscription updated for user:", userProfile.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: userProfile } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userProfile) {
          await supabase
            .from("user_profiles")
            .update({
              subscription_status: "expired",
              subscription_tier: "free",
            })
            .eq("id", userProfile.id);

          console.log("[Stripe Webhook] ✅ Subscription cancelled for user:", userProfile.id);
        }
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
