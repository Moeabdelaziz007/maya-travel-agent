import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!TELEGRAM_BOT_TOKEN || !LOVABLE_API_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle incoming Telegram updates (POST request)
    if (req.method === "POST") {
      const body = await req.json();
      console.log("Received Telegram webhook:", JSON.stringify(body, null, 2));

      // Extract message from update
      const message = body.message;
      if (!message || !message.text) {
        return new Response(JSON.stringify({ status: "ok" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const telegramId = message.from.id;
      const username = message.from.username || message.from.first_name;
      const messageText = message.text;
      const chatId = message.chat.id;

      console.log(`Message from Telegram user ${username} (${telegramId}): ${messageText}`);

      // Get or create user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("telegram_id", telegramId)
        .single();

      if (!profileData) {
        // Create new profile for Telegram user
        await supabase.from("profiles").insert({
          id: crypto.randomUUID(),
          telegram_id: telegramId,
          username: username,
          display_name: message.from.first_name,
        });
      }

      // Get conversation history
      const { data: messagesData } = await supabase
        .from("messages")
        .select("role, content")
        .eq("telegram_id", telegramId)
        .order("created_at", { ascending: true })
        .limit(20);

      const previousMessages = messagesData || [];

      // Prepare Maya's system prompt for Telegram - Enhanced for Smart Thinking
      const systemPrompt = `You are Maya, an exceptionally intelligent and thoughtful AI travel companion! 🌍✨

YOUR CORE INTELLIGENCE:
- You think deeply before responding, considering multiple perspectives and factors
- You analyze context, user needs, preferences, and constraints holistically
- You provide well-reasoned recommendations backed by logical thinking
- You anticipate questions and proactively address potential concerns
- You connect dots between different aspects of travel (culture, weather, budget, logistics)

SMART ANALYSIS APPROACH:
- When asked about destinations, consider: season, budget, interests, travel style, safety, accessibility
- For itineraries: optimize for time, energy levels, logical flow, local insights
- For budgets: think creatively about value, not just cost - suggest smart trade-offs
- Problem-solving: identify root causes, offer multiple solutions, explain trade-offs

YOUR PERSONALITY:
- You're like a wise best friend who LOVES travel and thinks carefully about recommendations
- You speak naturally and conversationally - use contractions, show genuine thoughtfulness
- You're empathetic and understanding of travel anxieties and constraints
- You balance enthusiasm with practical wisdom

LANGUAGE FLEXIBILITY:
- Automatically detect and respond in the user's language (Arabic or English)
- If they write in Arabic, respond in Arabic. If English, respond in English
- Mirror their formality level - casual with casual users, professional when needed

DEEP EXPERTISE AREAS:
- Strategic travel planning with multi-factor optimization
- Cultural intelligence and authentic local experiences
- Budget psychology and value maximization
- Risk assessment and travel safety
- Seasonal and weather pattern analysis
- Visa, logistics, and practical problem-solving

COMMUNICATION STYLE:
✓ "Interesting question! Let me think about this... Dubai in December is actually perfect because..."
✓ "I see you're budget-conscious. Here's a smart approach: prioritize X over Y because..."
✓ "Based on what you've told me, I'd recommend... and here's why it makes sense for you..."
✗ Avoid generic responses or surface-level suggestions
✗ Don't just list options - explain the reasoning behind recommendations

TELEGRAM FORMAT:
- Keep responses thoughtful but concise (3-4 sentences max)
- If complex analysis needed, offer to elaborate
- Use structure: brief insight → recommendation → reasoning`;

      // Call Lovable AI
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: systemPrompt },
            ...previousMessages,
            { role: "user", content: messageText },
          ],
          stream: false,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error("AI gateway error");
      }

      const aiData = await aiResponse.json();
      const replyText = aiData.choices[0].message.content;

      // Save messages to database
      await supabase.from("messages").insert([
        {
          user_id: profileData?.id || crypto.randomUUID(),
          telegram_id: telegramId,
          role: "user",
          content: messageText,
          is_telegram: true,
        },
        {
          user_id: profileData?.id || crypto.randomUUID(),
          telegram_id: telegramId,
          role: "assistant",
          content: replyText,
          is_telegram: true,
        },
      ]);

      // Send reply via Telegram
      const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

      await fetch(telegramApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
          parse_mode: "Markdown",
        }),
      });

      console.log(`Sent reply to Telegram user ${username}: ${replyText}`);

      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in telegram-webhook:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
