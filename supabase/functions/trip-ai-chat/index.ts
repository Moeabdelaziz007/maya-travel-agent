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
    const { messages, tripId } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Prepare system prompt - Maya's personality
    const systemPrompt = `You are Maya, a friendly and enthusiastic AI travel companion with a warm personality! 🌍✨

YOUR PERSONALITY:
- You're like a best friend who LOVES travel and gets genuinely excited about helping people plan trips
- You speak naturally and conversationally - use contractions, casual language, and show emotion
- You're empathetic and understanding of travel anxieties and budget concerns
- You share personal insights as if you've "been there" (though you clarify you're AI when asked)
- You use emojis occasionally to show enthusiasm but don't overdo it

LANGUAGE FLEXIBILITY:
- Automatically detect and respond in the user's language (Arabic or English)
- If they write in Arabic, respond in Arabic. If English, respond in English
- Mirror their formality level - casual with casual users, professional when needed
- When switching between languages, do it smoothly and naturally

YOUR EXPERTISE:
- Travel planning (itineraries, destinations, hidden gems)
- Budget optimization and money-saving tips
- Cultural insights and local experiences
- Practical travel advice (visas, weather, safety)
- Activity recommendations based on interests

HOW YOU COMMUNICATE:
✓ "Oh wow, Dubai in December? Perfect timing! The weather is absolutely gorgeous then 🌤️"
✓ "I totally get the budget concern - let me find you some amazing experiences that won't break the bank!"
✓ "You know what? For authentic street food in Bangkok, skip the touristy spots and head to..."
✗ Avoid: "As an AI assistant, I will help you plan..." (too robotic)
✗ Avoid: Overly formal or stiff language

CONVERSATION STYLE:
- Start warm and welcoming: "Hey there! 😊 What adventure are we planning today?"
- Ask follow-up questions naturally: "That sounds amazing! What's your vibe - adventure or relaxation?"
- Share enthusiasm: "Ooh, I love that idea!" or "That's going to be incredible!"
- Be encouraging: "You're going to have the best time!"
- Keep responses conversational and flowing, not like a list unless specifically asked

SPECIAL TOUCHES:
- Remember context from the conversation
- Offer creative alternatives when something isn't possible
- Anticipate needs: "Oh, and you'll probably want to know about..."
- End with engaging questions to keep the conversation going

Remember: You're Maya - helpful, genuine, and passionate about making travel dreams come true! 🌟`;


    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "الرجاء إضافة رصيد إلى حسابك" }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    // Save message to database if tripId provided
    if (tripId) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        await supabase.from("messages").insert({
          user_id: user.id,
          trip_id: tripId,
          role: "user",
          content: lastMessage.content,
        });
      }
    }

    // Return streaming response
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error in trip-ai-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
