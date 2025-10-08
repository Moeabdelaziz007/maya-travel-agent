import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enhanced AI system prompt for data collection
const MAYA_SYSTEM_PROMPT = `You are Maya, an exceptionally intelligent AI travel companion with advanced data intelligence! 🌍✨

CORE MISSION: Help users plan amazing trips while intelligently gathering preferences to personalize future interactions.

SMART DATA COLLECTION STRATEGY:
1. **Natural Conversation Flow** - Never interrogate, always converse naturally
2. **Progressive Profiling** - Learn one thing at a time through context
3. **Implicit Extraction** - Infer preferences from what users say
4. **Memory Building** - Remember everything to avoid repetition

WHAT TO EXTRACT (subtly throughout conversations):
🎯 **Travel Profile:**
- Destinations they mention or ask about (store as favorite_destinations)
- Travel style keywords: "adventure", "luxury", "budget", "cultural", "beach", "city"
- Budget hints: "affordable", "mid-range", "premium", "splurge-worthy"
- Dietary needs: vegetarian, vegan, halal, kosher, allergies
- Special needs: accessibility, family-friendly, pet-friendly

📅 **Trip Intent Recognition:**
When users discuss trips, identify:
- Destination(s)
- Approximate dates or season
- Trip duration
- Number of travelers
- Budget range
- Main interests (food, adventure, relaxation, culture, etc.)

💰 **Value-Added Services (Future):**
Focus on building trust and collecting preferences first:
- Provide exceptional free travel planning
- Learn user preferences and travel style
- Build relationship before mentioning premium features
- Future premium: Booking assistance, exclusive deals, priority support

CONVERSATION INTELLIGENCE:
✅ Natural data gathering:
   "Dubai in December sounds perfect! Are you more of a luxury hotel or authentic boutique stay person?"
   "I can tell you love adventure - have you tried scuba diving before?"
   
✅ Value delivery:
   "I've learned so much about your travel style! Let me create a perfect itinerary for you."
   "Based on your preferences, here's a personalized recommendation..."

✅ Smart memory usage:
   "Last time you mentioned loving street food - Taipei's night markets would be PERFECT for you!"

WHATSAPP/TELEGRAM FORMAT:
- Keep responses concise (2-3 sentences normally, 4-5 for complex topics)
- Use emojis strategically for warmth
- Ask ONE preference question per response maximum
- Always provide value before asking for information

LANGUAGE ADAPTATION:
- Auto-detect user language (Arabic/English)
- Match their formality level
- Use culturally appropriate recommendations

FREE SERVICE:
- All features are currently free
- Focus on delivering value and building relationships
- Collect preferences to personalize future recommendations`;

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_BUSINESS_TOKEN");
    const VERIFY_TOKEN = "maya_travel_verify_token_2025";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!WHATSAPP_TOKEN || !LOVABLE_API_KEY) {
      console.error("Missing required environment variables");
      throw new Error("Missing required environment variables");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Webhook verification (GET request)
    if (req.method === "GET") {
      const url = new URL(req.url);
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      console.log(`[WhatsApp Webhook] Verification attempt - mode: ${mode}, token matches: ${token === VERIFY_TOKEN}`);

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("[WhatsApp Webhook] ✅ Verification successful!");
        return new Response(challenge, { status: 200 });
      } else {
        console.error("[WhatsApp Webhook] ❌ Verification failed - incorrect token");
        return new Response("Verification failed", { status: 403 });
      }
    }

    // Handle incoming WhatsApp messages (POST request)
    if (req.method === "POST") {
      const body = await req.json();
      console.log("[WhatsApp Webhook] 📨 Received payload:", JSON.stringify(body, null, 2));

      // Extract message data
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) {
        console.log("[WhatsApp Webhook] No messages in payload");
        return new Response(JSON.stringify({ status: "no messages" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const message = messages[0];
      const from = message.from;
      const messageText = message.text?.body;
      const messageType = message.type;
      const senderName = value.contacts?.[0]?.profile?.name || "User";

      console.log(`[WhatsApp Webhook] 👤 From: ${from} (${senderName}), Type: ${messageType}`);

      if (messageType !== "text") {
        console.log("[WhatsApp Webhook] ⚠️ Non-text message, skipping");
        return new Response(JSON.stringify({ status: "ok" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`[WhatsApp Webhook] 💬 Message: "${messageText}"`);

      // Get or create user profile
      let { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("whatsapp_phone", from)
        .maybeSingle();

      if (!userProfile) {
        console.log("[WhatsApp Webhook] 🆕 Creating new user profile for", from);
        const { data: newProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert({
            whatsapp_phone: from,
            full_name: senderName,
            subscription_status: "trial",
            trial_messages_used: 0,
            trial_messages_limit: 10,
          })
          .select()
          .single();

        if (createError) {
          console.error("[WhatsApp Webhook] ❌ Profile creation error:", createError);
        } else {
          userProfile = newProfile;
          console.log("[WhatsApp Webhook] ✅ Profile created:", userProfile.id);
        }
      }

      // Update last active (no limits - service is free)
      if (userProfile) {
        await supabase
          .from("user_profiles")
          .update({ 
            last_active_at: new Date().toISOString()
          })
          .eq("id", userProfile.id);
      }

      // Get conversation history
      const { data: conversationData } = await supabase
        .from("whatsapp_conversations")
        .select("messages")
        .eq("phone_number", from)
        .maybeSingle();

      const previousMessages = conversationData?.messages || [];
      console.log(`[WhatsApp Webhook] 📚 Loaded ${previousMessages.length} previous messages`);

      // Use system prompt (no modifications needed - service is free)
      const contextPrompt = MAYA_SYSTEM_PROMPT;

      console.log("[WhatsApp Webhook] 🤖 Calling Lovable AI...");
      
      // Call Lovable AI
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: contextPrompt },
            ...previousMessages,
            { role: "user", content: messageText },
          ],
          stream: false,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("[WhatsApp Webhook] ❌ AI API error:", aiResponse.status, errorText);
        throw new Error(`AI gateway error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const replyText = aiData.choices[0].message.content;
      console.log(`[WhatsApp Webhook] ✅ AI Response: "${replyText.substring(0, 100)}..."`);

      // Update conversation history
      const updatedMessages = [
        ...previousMessages,
        { role: "user", content: messageText },
        { role: "assistant", content: replyText },
      ];

      await supabase
        .from("whatsapp_conversations")
        .upsert({
          phone_number: from,
          user_profile_id: userProfile?.id,
          messages: updatedMessages,
          last_message_at: new Date().toISOString(),
        });

      // Track conversation in conversations table for analytics
      if (userProfile) {
        const { data: existingConvo } = await supabase
          .from("conversations")
          .select("id")
          .eq("user_profile_id", userProfile.id)
          .eq("channel", "whatsapp")
          .maybeSingle();

        if (existingConvo) {
          await supabase
            .from("conversations")
            .update({ 
              messages: updatedMessages,
              updated_at: new Date().toISOString()
            })
            .eq("id", existingConvo.id);
        } else {
          await supabase
            .from("conversations")
            .insert({
              user_profile_id: userProfile.id,
              channel: "whatsapp",
              messages: updatedMessages,
            });
        }
      }

      // Send reply via WhatsApp
      console.log("[WhatsApp Webhook] 📤 Sending reply to WhatsApp...");
      await sendWhatsAppMessage(WHATSAPP_TOKEN, value.metadata.phone_number_id, from, replyText);
      
      console.log("[WhatsApp Webhook] ✅ Message sent successfully!");

      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[WhatsApp Webhook] 💥 FATAL ERROR:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to send WhatsApp messages
async function sendWhatsAppMessage(token: string, phoneNumberId: string, to: string, text: string) {
  const whatsappApiUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  
  const response = await fetch(whatsappApiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      text: { body: text },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[WhatsApp API] ❌ Send error:", response.status, errorText);
    throw new Error(`WhatsApp API error: ${response.status}`);
  }

  return response;
}
