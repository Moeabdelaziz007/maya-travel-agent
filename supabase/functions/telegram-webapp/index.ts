import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mini App HTML that will be served
const MINI_APP_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maya Travel Planner</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--tg-theme-bg-color, #ffffff);
      color: var(--tg-theme-text-color, #000000);
      padding: 16px;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .header p {
      color: var(--tg-theme-hint-color, #999);
      font-size: 14px;
    }
    
    .trip-form {
      background: var(--tg-theme-secondary-bg-color, #f5f5f5);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--tg-theme-text-color, #000);
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--tg-theme-hint-color, #ddd);
      border-radius: 8px;
      font-size: 14px;
      background: var(--tg-theme-bg-color, #fff);
      color: var(--tg-theme-text-color, #000);
    }
    
    .form-group textarea {
      min-height: 80px;
      resize: vertical;
    }
    
    .btn {
      width: 100%;
      padding: 14px;
      background: var(--tg-theme-button-color, #3390ec);
      color: var(--tg-theme-button-text-color, #ffffff);
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    
    .btn:active {
      opacity: 0.8;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .quick-destinations {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-top: 8px;
    }
    
    .quick-destination {
      padding: 8px 12px;
      background: var(--tg-theme-button-color, #3390ec);
      color: var(--tg-theme-button-text-color, #fff);
      border: none;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    
    .quick-destination:active {
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌍 Maya Travel Planner</h1>
      <p>Plan your dream trip with AI</p>
    </div>
    
    <form class="trip-form" id="tripForm">
      <div class="form-group">
        <label for="destination">Where do you want to go?</label>
        <input type="text" id="destination" name="destination" placeholder="e.g., Paris, Tokyo, Dubai" required>
        <div class="quick-destinations">
          <button type="button" class="quick-destination" data-dest="Dubai, UAE">Dubai 🇦🇪</button>
          <button type="button" class="quick-destination" data-dest="Paris, France">Paris 🇫🇷</button>
          <button type="button" class="quick-destination" data-dest="Tokyo, Japan">Tokyo 🇯🇵</button>
          <button type="button" class="quick-destination" data-dest="Bali, Indonesia">Bali 🇮🇩</button>
        </div>
      </div>
      
      <div class="form-group">
        <label for="dates">When?</label>
        <input type="text" id="dates" name="dates" placeholder="e.g., Next month, December 2025">
      </div>
      
      <div class="form-group">
        <label for="duration">How long?</label>
        <select id="duration" name="duration">
          <option value="">Select duration</option>
          <option value="3-4 days">3-4 days</option>
          <option value="5-7 days">5-7 days</option>
          <option value="1-2 weeks">1-2 weeks</option>
          <option value="2+ weeks">2+ weeks</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="budget">Budget range</label>
        <select id="budget" name="budget">
          <option value="">Select budget</option>
          <option value="budget">Budget-friendly ($)</option>
          <option value="moderate">Moderate ($$)</option>
          <option value="luxury">Luxury ($$$)</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="preferences">What do you love?</label>
        <textarea id="preferences" name="preferences" placeholder="e.g., Adventure, food tours, beaches, culture, nightlife..."></textarea>
      </div>
      
      <button type="submit" class="btn" id="submitBtn">
        ✨ Plan My Trip with Maya
      </button>
    </form>
  </div>
  
  <script>
    // Initialize Telegram Web App
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.MainButton.hide();
    
    // Quick destination buttons
    document.querySelectorAll('.quick-destination').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('destination').value = btn.dataset.dest;
      });
    });
    
    // Form submission
    document.getElementById('tripForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.textContent = '🔄 Planning your trip...';
      
      const formData = {
        destination: document.getElementById('destination').value,
        dates: document.getElementById('dates').value,
        duration: document.getElementById('duration').value,
        budget: document.getElementById('budget').value,
        preferences: document.getElementById('preferences').value,
        telegram_user: tg.initDataUnsafe.user
      };
      
      try {
        // Send to Maya for AI planning
        const prompt = \`Plan a trip to \${formData.destination}\${formData.dates ? \` in \${formData.dates}\` : ''}\${formData.duration ? \` for \${formData.duration}\` : ''}. Budget: \${formData.budget || 'flexible'}. Interests: \${formData.preferences || 'general sightseeing'}. Create a personalized itinerary.\`;
        
        // Show success and return to chat
        tg.showAlert('✅ Trip planned! Check your chat with Maya for the full itinerary.', () => {
          tg.close();
        });
        
        // Send message through Telegram bot
        await fetch(\`https://\${window.location.host}/functions/v1/telegram-webhook\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: {
              from: tg.initDataUnsafe.user,
              text: prompt,
              chat: { id: tg.initDataUnsafe.user?.id }
            }
          })
        });
        
      } catch (error) {
        console.error('Error:', error);
        tg.showAlert('⚠️ Something went wrong. Please try again or message Maya directly.');
        submitBtn.disabled = false;
        submitBtn.textContent = '✨ Plan My Trip with Maya';
      }
    });
  </script>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Serve the Mini App HTML
    return new Response(MINI_APP_HTML, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[Telegram WebApp] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
