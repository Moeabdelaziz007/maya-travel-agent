/**
 * Advanced Telegram Bot with Maya AI Integration
 * Professional travel agent bot with powerful LLM and MCP tools
 */

const TelegramBot = require('node-telegram-bot-api');
const ZaiClient = require('./src/ai/zaiClient');
const MayaPersona = require('./src/ai/mayaPersona');
const MCPTools = require('./src/ai/mcpTools');
const UserProfilingSystem = require('./src/ai/userProfiling');
require('dotenv').config();

class AdvancedTelegramBot {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
      polling: true,
      request: {
        agentOptions: {
          keepAlive: true,
          family: 4
        }
      }
    });

    // Initialize AI components
    this.zaiClient = new ZaiClient();
    this.mayaPersona = new MayaPersona();
    this.mcpTools = new MCPTools();
    this.userProfiling = new UserProfilingSystem();

    // Bot state management
    this.userStates = new Map();
    this.conversationHistory = new Map();
    this.activeSessions = new Map();

    // Bot statistics
    this.stats = {
      totalUsers: 0,
      activeConversations: 0,
      totalMessages: 0,
      successfulBookings: 0
    };

    this.setupBotHandlers();
    this.startPeriodicTasks();
    
    console.log('🤖 Advanced Maya Telegram Bot initialized successfully!');
  }

  /**
   * Setup bot command handlers
   */
  setupBotHandlers() {
    // Start command with advanced welcome
    this.bot.onText(/\/start/, async (msg) => {
      await this.handleStartCommand(msg);
    });

    // Help command with dynamic help
    this.bot.onText(/\/help/, async (msg) => {
      await this.handleHelpCommand(msg);
    });

    // Profile command
    this.bot.onText(/\/profile/, async (msg) => {
      await this.handleProfileCommand(msg);
    });

    // Trip planning command
    this.bot.onText(/\/trip/, async (msg) => {
      await this.handleTripCommand(msg);
    });

    // Budget analysis command
    this.bot.onText(/\/budget/, async (msg) => {
      await this.handleBudgetCommand(msg);
    });

    // Weather command
    this.bot.onText(/\/weather/, async (msg) => {
      await this.handleWeatherCommand(msg);
    });

    // Recommendations command
    this.bot.onText(/\/recommend/, async (msg) => {
      await this.handleRecommendCommand(msg);
    });

    // Settings command
    this.bot.onText(/\/settings/, async (msg) => {
      await this.handleSettingsCommand(msg);
    });

    // Payment command
    this.bot.onText(/\/payment/, async (msg) => {
      await this.handlePaymentCommand(msg);
    });

    // Handle all other messages as AI conversation
    this.bot.on('message', async (msg) => {
      if (!msg.text || msg.text.startsWith('/')) return;
      await this.handleAIConversation(msg);
    });

    // Handle callback queries
    this.bot.on('callback_query', async (callbackQuery) => {
      await this.handleCallbackQuery(callbackQuery);
    });

    // Error handling
    this.bot.on('error', (error) => {
      console.error('Telegram Bot Error:', error);
    });

    this.bot.on('polling_error', (error) => {
      console.error('Telegram Bot Polling Error:', error);
    });
  }

  /**
   * Handle start command with advanced user onboarding
   */
  async handleStartCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const userName = msg.from.first_name || 'صديقي';

    try {
      // Create or get user profile
      let userProfile = this.userProfiling.getProfile(userId);
      if (!userProfile) {
        await this.userProfiling.createUserProfile(userId, {
          name: userName,
          telegramId: msg.from.id,
          username: msg.from.username
        });
        userProfile = this.userProfiling.getProfile(userId);
      }

      // Update user state
      this.userStates.set(userId, {
        stage: 'welcome',
        lastActivity: new Date(),
        context: {}
      });

      // Generate personalized welcome message
      const welcomeMessage = await this.generatePersonalizedWelcome(userProfile, userName);
      
      // Send welcome message with advanced keyboard
      await this.bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🚀 تخطيط رحلة جديدة', callback_data: 'new_trip' },
              { text: '💰 تحليل الميزانية', callback_data: 'budget_analysis' }
            ],
            [
              { text: '🌍 نصائح الوجهات', callback_data: 'destination_tips' },
              { text: '🌤️ حالة الطقس', callback_data: 'weather_check' }
            ],
            [
              { text: '👤 ملفي الشخصي', callback_data: 'my_profile' },
              { text: '⚙️ الإعدادات', callback_data: 'settings' }
            ],
            [
              { text: '💳 الدفع الآمن', callback_data: 'payment_system' },
              { text: '❓ المساعدة الذكية', callback_data: 'smart_help' }
            ],
            [
              { text: '🌐 فتح التطبيق الكامل', web_app: { url: process.env.WEB_APP_URL || 'http://localhost:3000' } }
            ]
          ]
        }
      });

      // Update statistics
      this.stats.totalUsers++;
      this.stats.activeConversations++;

    } catch (error) {
      console.error('Error in start command:', error);
      await this.bot.sendMessage(chatId, 'مرحباً! أنا مايا، مساعدتك الذكية للسفر. كيف يمكنني مساعدتك اليوم؟');
    }
  }

  /**
   * Handle AI conversation with advanced processing
   */
  async handleAIConversation(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const message = msg.text;

    try {
      // Show typing indicator
      await this.bot.sendChatAction(chatId, 'typing');

      // Get or create user profile
      let userProfile = this.userProfiling.getProfile(userId);
      if (!userProfile) {
        await this.userProfiling.createUserProfile(userId, {
          name: msg.from.first_name,
          telegramId: msg.from.id
        });
        userProfile = this.userProfiling.getProfile(userId);
      }

      // Get conversation history
      let conversationHistory = this.conversationHistory.get(userId) || [];
      
      // Analyze conversation for insights
      const conversationAnalysis = await this.userProfiling.analyzeConversation(userId, {
        messages: [{ content: message, timestamp: new Date().toISOString() }]
      });

      // Generate Maya's system prompt with user context
      const systemPrompt = this.mayaPersona.generateSystemPrompt({
        user_name: userProfile.basicInfo.name,
        user_preferences: userProfile.preferences,
        conversation_history: conversationHistory,
        current_goal: this.userStates.get(userId)?.context?.currentGoal || '',
        cultural_background: userProfile.personalization.culturalBackground
      });

      // Prepare messages for AI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Last 10 messages for context
        { role: 'user', content: message }
      ];

      // Get AI response
      const aiResponse = await this.zaiClient.chatCompletion(messages, {
        maxTokens: 1000,
        temperature: 0.7,
        enableKvCacheOffload: true
      });

      if (aiResponse.success) {
        // Store conversation
        conversationHistory.push(
          { role: 'user', content: message, timestamp: new Date().toISOString() },
          { role: 'assistant', content: aiResponse.content, timestamp: new Date().toISOString() }
        );
        this.conversationHistory.set(userId, conversationHistory.slice(-20)); // Keep last 20 messages

        // Check if AI response suggests using tools
        const toolSuggestions = this.detectToolSuggestions(aiResponse.content);
        
        let responseMessage = aiResponse.content;
        let replyMarkup = null;

        if (toolSuggestions.length > 0) {
          replyMarkup = this.createToolKeyboard(toolSuggestions);
        }

        // Send response
        await this.bot.sendMessage(chatId, responseMessage, {
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        });

        // Track user behavior
        await this.userProfiling.trackUserBehavior(userId, {
          action: 'message_sent',
          context: { message_length: message.length, response_time: Date.now() },
          satisfaction: null // Would be collected via feedback
        });

        // Update statistics
        this.stats.totalMessages++;

      } else {
        await this.bot.sendMessage(chatId, 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.');
      }

    } catch (error) {
      console.error('Error in AI conversation:', error);
      await this.bot.sendMessage(chatId, 'عذراً، واجهت مشكلة تقنية. كيف يمكنني مساعدتك؟');
    }
  }

  /**
   * Generate personalized welcome message
   */
  async generatePersonalizedWelcome(userProfile, userName) {
    const welcomeMessages = [
      `🌍 مرحباً ${userName}! أنا مايا، خبيرة السفر الشخصية الخاصة بك ✨\n\n`,
      '🎯 أنا هنا لمساعدتك في تخطيط رحلة مثالية تناسب تفضيلاتك وميزانيتك\n\n',
      '🧠 ذكائي الاصطناعي المتقدم يساعدني في:\n',
      '• 📍 اقتراح أفضل الوجهات\n',
      '• 💰 تحليل ميزانيتك بذكاء\n',
      '• 🏨 العثور على أفضل الإقامات\n',
      '• 🍽️ توصيات المطاعم الحلال\n',
      '• ⏰ أوقات الصلاة في وجهتك\n',
      '• 🌤️ حالة الطقس المحدثة\n',
      '• 🛡️ نصائح الأمان والسفر\n\n',
      '💬 تحدث معي بشكل طبيعي وسأساعدك في كل شيء!\n\n',
      '🚀 ما الذي تود التخطيط له اليوم؟'
    ];

    // Add personalized touches based on user profile
    if (userProfile.preferences.travelStyle === 'luxury') {
      welcomeMessages.push('\n💎 أرى أنك تحب السفر الفاخر - لدي توصيات رائعة لك!');
    } else if (userProfile.preferences.travelStyle === 'budget') {
      welcomeMessages.push('\n💡 سأساعدك في العثور على أفضل العروض والتوفير!');
    }

    if (userProfile.personalization.religiousRequirements.includes('halal_food')) {
      welcomeMessages.push('\n🕌 سأتأكد من توفر الطعام الحلال في جميع توصياتي!');
    }

    return welcomeMessages.join('');
  }

  /**
   * Handle trip planning command
   */
  async handleTripCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    // Set user state
    this.userStates.set(userId, {
      stage: 'trip_planning',
      lastActivity: new Date(),
      context: { currentGoal: 'trip_planning' }
    });

    const tripMessage = `
🗺️ <b>تخطيط رحلة جديدة</b>

أخبرني عن رحلتك المثالية:

📍 <b>الوجهة:</b> إلى أين تريد السفر؟
📅 <b>التوقيت:</b> متى تخطط للسفر؟
💰 <b>الميزانية:</b> ما هو ميزانيتك التقريبي؟
👥 <b>عدد المسافرين:</b> كم شخص؟
🎯 <b>نوع الرحلة:</b> عائلية، رومانسية، مغامرة، ثقافية؟

أو اكتب لي ببساطة: "أريد رحلة إلى تركيا لمدة أسبوع بميزانية 5000 ريال"
`;

    await this.bot.sendMessage(chatId, tripMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🇹🇷 تركيا', callback_data: 'destination_turkey' },
            { text: '🇲🇾 ماليزيا', callback_data: 'destination_malaysia' },
            { text: '🇹🇭 تايلاند', callback_data: 'destination_thailand' }
          ],
          [
            { text: '🇦🇪 الإمارات', callback_data: 'destination_uae' },
            { text: '🇪🇬 مصر', callback_data: 'destination_egypt' },
            { text: '🇲🇦 المغرب', callback_data: 'destination_morocco' }
          ],
          [
            { text: '🌍 وجهة أخرى', callback_data: 'destination_other' }
          ]
        ]
      }
    });
  }

  /**
   * Handle budget analysis command
   */
  async handleBudgetCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const budgetMessage = `
💰 <b>تحليل الميزانية الذكي</b>

سأساعدك في تحليل ميزانيتك وتقديم أفضل التوصيات:

🔍 <b>ما الذي تريد تحليله؟</b>

• 💸 تحليل تكلفة رحلة معينة
• 📊 مقارنة الوجهات من ناحية التكلفة  
• 🎯 اقتراح وجهات تناسب ميزانيتك
• 💡 نصائح لتوفير المال أثناء السفر
• 📈 تخطيط ميزانية شهرية للسفر

اكتب لي تفاصيل ميزانيتك أو استخدم الأزرار أدناه:
`;

    await this.bot.sendMessage(chatId, budgetMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💸 تحليل تكلفة رحلة', callback_data: 'analyze_trip_cost' },
            { text: '📊 مقارنة الوجهات', callback_data: 'compare_destinations' }
          ],
          [
            { text: '🎯 وجهات تناسب ميزانيتي', callback_data: 'budget_destinations' },
            { text: '💡 نصائح التوفير', callback_data: 'saving_tips' }
          ],
          [
            { text: '📈 تخطيط ميزانية', callback_data: 'budget_planning' }
          ]
        ]
      }
    });
  }

  /**
   * Handle weather command
   */
  async handleWeatherCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const weatherMessage = `
🌤️ <b>خدمة الطقس المحدثة</b>

أخبرني عن وجهتك وسأعطيك:
• 🌡️ درجة الحرارة الحالية والمتوقعة
• 🌧️ احتمالية هطول الأمطار
• 👕 نصائح الملابس المناسبة
• 🎒 ما يجب حمله معك

اكتب اسم المدينة أو البلد:
`;

    await this.bot.sendMessage(chatId, weatherMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🌍 مدن شائعة', callback_data: 'weather_popular_cities' },
            { text: '📱 حفظ موقعي', callback_data: 'weather_save_location' }
          ]
        ]
      }
    });
  }

  /**
   * Handle callback queries with advanced processing
   */
  async handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id.toString();
    const data = callbackQuery.data;

    try {
      // Answer callback query first
      await this.bot.answerCallbackQuery(callbackQuery.id);

      // Handle different callback types
      if (data.startsWith('destination_')) {
        await this.handleDestinationSelection(chatId, userId, data);
      } else if (data === 'new_trip') {
        await this.handleTripCommand({ chat: { id: chatId }, from: { id: userId } });
      } else if (data === 'budget_analysis') {
        await this.handleBudgetCommand({ chat: { id: chatId }, from: { id: userId } });
      } else if (data === 'weather_check') {
        await this.handleWeatherCommand({ chat: { id: chatId }, from: { id: userId } });
      } else if (data === 'my_profile') {
        await this.handleProfileCommand({ chat: { id: chatId }, from: { id: userId } });
      } else if (data === 'settings') {
        await this.handleSettingsCommand({ chat: { id: chatId }, from: { id: userId } });
      } else if (data.startsWith('weather_')) {
        await this.handleWeatherCallback(chatId, userId, data);
      } else if (data.startsWith('payment_')) {
        await this.handlePaymentCallback(chatId, userId, data);
      } else {
        // Default handling
        await this.handleGenericCallback(chatId, userId, data);
      }

    } catch (error) {
      console.error('Error handling callback query:', error);
      await this.bot.sendMessage(chatId, 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.');
    }
  }

  /**
   * Handle destination selection
   */
  async handleDestinationSelection(chatId, userId, data) {
    const destinationMap = {
      'destination_turkey': 'تركيا',
      'destination_malaysia': 'ماليزيا',
      'destination_thailand': 'تايلاند',
      'destination_uae': 'الإمارات',
      'destination_egypt': 'مصر',
      'destination_morocco': 'المغرب'
    };

    const destination = destinationMap[data] || 'وجهة أخرى';

    // Get user profile for personalized recommendations
    const userProfile = this.userProfiling.getProfile(userId);
    
    // Generate personalized response using AI
    const systemPrompt = this.mayaPersona.generateSystemPrompt({
      user_preferences: userProfile?.preferences || {},
      current_goal: 'destination_info'
    });

    const aiResponse = await this.zaiClient.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `أريد معلومات عن ${destination} للسفر` }
    ], { maxTokens: 800 });

    let responseMessage = aiResponse.success ? aiResponse.content : `ممتاز! ${destination} وجهة رائعة. كيف يمكنني مساعدتك أكثر؟`;

    // Add quick actions
    await this.bot.sendMessage(chatId, responseMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: `🏨 فنادق في ${destination}`, callback_data: `hotels_${data}` },
            { text: `🍽️ مطاعم حلال في ${destination}`, callback_data: `restaurants_${data}` }
          ],
          [
            { text: `🌤️ طقس ${destination}`, callback_data: `weather_${destination}` },
            { text: `📋 خطة رحلة لـ ${destination}`, callback_data: `itinerary_${data}` }
          ],
          [
            { text: '💳 حجز فوري', callback_data: `book_${data}` },
            { text: '💰 تحليل التكلفة', callback_data: `cost_${data}` }
          ]
        ]
      }
    });
  }

  /**
   * Detect tool suggestions in AI response
   */
  detectToolSuggestions(response) {
    const toolSuggestions = [];
    
    if (response.includes('طقس') || response.includes('درجة حرارة')) {
      toolSuggestions.push('weather');
    }
    
    if (response.includes('فندق') || response.includes('إقامة')) {
      toolSuggestions.push('accommodation');
    }
    
    if (response.includes('مطعم') || response.includes('طعام')) {
      toolSuggestions.push('restaurants');
    }
    
    if (response.includes('صلاة') || response.includes('مسجد')) {
      toolSuggestions.push('prayer_times');
    }

    return toolSuggestions;
  }

  /**
   * Create tool keyboard
   */
  createToolKeyboard(tools) {
    const keyboard = [];
    
    tools.forEach(tool => {
      const toolButtons = {
        'weather': { text: '🌤️ حالة الطقس', callback_data: 'tool_weather' },
        'accommodation': { text: '🏨 الفنادق', callback_data: 'tool_accommodation' },
        'restaurants': { text: '🍽️ المطاعم', callback_data: 'tool_restaurants' },
        'prayer_times': { text: '🕌 أوقات الصلاة', callback_data: 'tool_prayer_times' }
      };
      
      if (toolButtons[tool]) {
        keyboard.push([toolButtons[tool]]);
      }
    });

    return keyboard.length > 0 ? { inline_keyboard: keyboard } : null;
  }

  /**
   * Start periodic tasks
   */
  startPeriodicTasks() {
    // Clean up old conversation history every hour
    setInterval(() => {
      this.cleanupConversationHistory();
    }, 60 * 60 * 1000);

    // Update user activity status every 5 minutes
    setInterval(() => {
      this.updateUserActivity();
    }, 5 * 60 * 1000);

    // Send periodic insights to users
    setInterval(() => {
      this.sendPeriodicInsights();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  /**
   * Cleanup old conversation history
   */
  cleanupConversationHistory() {
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    for (const [userId, history] of this.conversationHistory.entries()) {
      const filteredHistory = history.filter(msg => 
        new Date(msg.timestamp) > cutoffTime
      );
      
      if (filteredHistory.length === 0) {
        this.conversationHistory.delete(userId);
      } else {
        this.conversationHistory.set(userId, filteredHistory);
      }
    }
  }

  /**
   * Update user activity
   */
  updateUserActivity() {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
    
    for (const [userId, state] of this.userStates.entries()) {
      if (now - state.lastActivity > inactiveThreshold) {
        this.userStates.delete(userId);
        this.activeSessions.delete(userId);
      }
    }
    
    this.stats.activeConversations = this.activeSessions.size;
  }

  /**
   * Send periodic insights to active users
   */
  async sendPeriodicInsights() {
    // This would send personalized travel insights to users
    // Implementation would depend on user preferences and activity
  }

  /**
   * Get bot statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeUsers: this.userStates.size,
      totalProfiles: this.userProfiling.getAllProfiles().length
    };
  }

  /**
   * Handle profile command
   */
  async handleProfileCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const userProfile = this.userProfiling.getProfile(userId);
    if (!userProfile) {
      await this.bot.sendMessage(chatId, 'لم يتم العثور على ملفك الشخصي. يرجى استخدام /start أولاً.');
      return;
    }

    const profileMessage = `
👤 <b>ملفك الشخصي - ${userProfile.basicInfo.name}</b>

📊 <b>إحصائياتك:</b>
• 🎯 الرحلات المخططة: ${userProfile.analytics.totalTrips}
• 💰 إجمالي الإنفاق: ${userProfile.analytics.totalSpent} ريال
• ⭐ مستوى الرضا: ${userProfile.analytics.satisfactionTrend}

🎨 <b>تفضيلاتك:</b>
• 🏃 نمط السفر: ${userProfile.preferences.travelStyle}
• 🏨 نوع الإقامة: ${userProfile.preferences.accommodationType}
• 🍽️ الطعام: ${userProfile.preferences.foodPreferences}
• 💰 الميزانية: ${userProfile.preferences.budgetRange}

🌍 <b>الوجهات المفضلة:</b>
${userProfile.travelHistory.favoritePlaces.length > 0 ? 
    userProfile.travelHistory.favoritePlaces.join(', ') : 'لم يتم تحديد أي وجهات بعد'}

📈 <b>نصائح مخصصة:</b>
${userProfile.personalization.interests.length > 0 ? 
    `• مهتم بـ: ${userProfile.personalization.interests.join(', ')}` : ''}
`;

    await this.bot.sendMessage(chatId, profileMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✏️ تعديل التفضيلات', callback_data: 'edit_preferences' },
            { text: '📊 إحصائيات مفصلة', callback_data: 'detailed_stats' }
          ],
          [
            { text: '🎯 تحديث الأهداف', callback_data: 'update_goals' },
            { text: '📱 مشاركة الملف', callback_data: 'share_profile' }
          ]
        ]
      }
    });
  }

  /**
   * Handle settings command
   */
  async handleSettingsCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const settingsMessage = `
⚙️ <b>الإعدادات</b>

🔧 <b>إعدادات المحادثة:</b>
• اللغة: العربية
• نمط الرد: ودود ومفصل
• مستوى التفاصيل: عالي

🔔 <b>الإشعارات:</b>
• تحديثات الرحلة: مفعلة
• عروض خاصة: مفعلة
• نصائح السفر: مفعلة

🌍 <b>التفضيلات العامة:</b>
• المنطقة الزمنية: الرياض
• العملة: ريال سعودي
• وحدات القياس: متري

🎨 <b>التخصيص:</b>
• أسلوب التواصل: ودود
• كثافة المعلومات: عالية
• مستوى الفكاهة: متوسط
`;

    await this.bot.sendMessage(chatId, settingsMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🌍 تغيير اللغة', callback_data: 'change_language' },
            { text: '🔔 إعدادات الإشعارات', callback_data: 'notification_settings' }
          ],
          [
            { text: '🎨 تخصيص المحادثة', callback_data: 'customize_chat' },
            { text: '💾 حفظ الإعدادات', callback_data: 'save_settings' }
          ],
          [
            { text: '🔄 إعادة تعيين', callback_data: 'reset_settings' }
          ]
        ]
      }
    });
  }

  /**
   * Handle payment command
   */
  async handlePaymentCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const paymentMessage = `
💳 <b>نظام الدفع الآمن</b>

🔐 <b>الميزات الأمنية:</b>
• تشفير SSL متقدم
• حماية PCI DSS
• تأكيد فوري للدفع
• دعم جميع البطاقات

💱 <b>طرق الدفع المدعومة:</b>
• 💳 بطاقات الائتمان/الخصم
• 🏦 التحويل البنكي
• 📱 المحافظ الرقمية
• 💰 مدفوعات تليجرام

🌍 <b>العملات المدعومة:</b>
• ريال سعودي (SAR)
• دولار أمريكي (USD)
• يورو (EUR)
• درهم إماراتي (AED)

💰 <b>إنشاء رابط دفع:</b>
أدخل المبلغ المطلوب:
`;

    await this.bot.sendMessage(chatId, paymentMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💳 إنشاء رابط دفع', callback_data: 'create_payment_link' },
            { text: '📊 تاريخ المدفوعات', callback_data: 'payment_history' }
          ],
          [
            { text: '🔒 الأمان والحماية', callback_data: 'payment_security' },
            { text: '❓ مساعدة الدفع', callback_data: 'payment_help' }
          ]
        ]
      }
    });
  }

  /**
   * Handle help command
   */
  async handleHelpCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const helpMessage = `
❓ <b>مساعدة مايا الذكية</b>

🤖 <b>كيف أستخدم مايا؟</b>
مايا مساعدتك الذكية للسفر. يمكنك:
• التحدث معي بشكل طبيعي
• استخدام الأوامر السريعة
• الضغط على الأزرار التفاعلية

📋 <b>الأوامر المتاحة:</b>
/start - بدء المحادثة
/help - عرض هذه المساعدة
/trip - تخطيط رحلة جديدة
/budget - تحليل الميزانية
/weather - حالة الطقس
/profile - ملفك الشخصي
/settings - الإعدادات
/payment - نظام الدفع

🎯 <b>مثال على الاستخدام:</b>
"أريد رحلة إلى تركيا لمدة أسبوع بميزانية 5000 ريال"

🧠 <b>ذكاء مايا:</b>
• تحليل تفضيلاتك الشخصية
• اقتراح وجهات مناسبة
• حساب التكاليف بدقة
• توفير نصائح مخصصة
• دعم الطعام الحلال
• أوقات الصلاة في وجهتك

💬 <b>نصائح للاستخدام الأمثل:</b>
• كن محدداً في طلباتك
• اذكر ميزانيتك التقريبية
• أخبرني عن اهتماماتك
• اسأل عن أي شيء متعلق بالسفر
`;

    await this.bot.sendMessage(chatId, helpMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🚀 تخطيط رحلة', callback_data: 'new_trip' },
            { text: '💰 تحليل الميزانية', callback_data: 'budget_analysis' }
          ],
          [
            { text: '🌤️ حالة الطقس', callback_data: 'weather_check' },
            { text: '👤 ملفي الشخصي', callback_data: 'my_profile' }
          ],
          [
            { text: '💬 أمثلة على الاستخدام', callback_data: 'usage_examples' },
            { text: '📞 الدعم الفني', callback_data: 'technical_support' }
          ]
        ]
      }
    });
  }

  /**
   * Handle recommend command
   */
  async handleRecommendCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const userProfile = this.userProfiling.getProfile(userId);
    const recommendations = await this.userProfiling.generatePersonalizedRecommendations(
      userId, 
      'general', 
      {}
    );

    if (recommendations.success) {
      const recommendMessage = `
🎯 <b>توصيات مخصصة لك</b>

📍 <b>الوجهات المقترحة:</b>
${recommendations.recommendations.destinations.slice(0, 3).map(dest => 
    `• ${dest.name} (${dest.score}/100) - ${dest.reason}`
  ).join('\n')}

🎨 <b>أنشطة مناسبة لك:</b>
${recommendations.recommendations.activities.slice(0, 3).map(activity => 
    `• ${activity.name} - ${activity.description}`
  ).join('\n')}

🏨 <b>نوع الإقامة المناسب:</b>
${recommendations.recommendations.accommodations.slice(0, 2).map(acc => 
    `• ${acc.type} - ${acc.reason}`
  ).join('\n')}

📊 <b>درجة التخصيص: ${recommendations.personalizationScore}/100</b>
`;

      await this.bot.sendMessage(chatId, recommendMessage, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📍 تفاصيل الوجهات', callback_data: 'destination_details' },
              { text: '🎯 خطة رحلة', callback_data: 'create_itinerary' }
            ],
            [
              { text: '💰 حساب التكلفة', callback_data: 'calculate_cost' },
              { text: '🔄 توصيات جديدة', callback_data: 'new_recommendations' }
            ]
          ]
        }
      });
    } else {
      await this.bot.sendMessage(chatId, 'أخبرني عن تفضيلاتك وسأقدم لك توصيات مخصصة!');
    }
  }
}

// Initialize the advanced bot
const advancedBot = new AdvancedTelegramBot();

// Export for use in other modules
module.exports = AdvancedTelegramBot;

// Keep the process alive
process.on('SIGINT', () => {
  console.log('🤖 Shutting down Advanced Maya Telegram Bot...');
  process.exit(0);
});