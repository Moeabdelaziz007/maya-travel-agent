const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Enterprise-grade utilities
const logger = require('./utils/logger');
const { errorHandler, AppError } = require('./utils/errorHandler');
const conversationManager = require('./utils/conversationManager');
const healthMonitor = require('./utils/healthMonitor');
const ZaiClient = require('./src/ai/zaiClient');

// Initialize Z.ai client
const zaiClient = new ZaiClient();

// Initialize Telegram Bot with error handling
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Payment service integration
const PaymentService = require('./routes/payment');

// Bot error handling
bot.on('polling_error', (error) => {
  errorHandler.handle(error, { source: 'telegram_polling' });
});

bot.on('error', (error) => {
  errorHandler.handle(error, { source: 'telegram_bot' });
});

// Wrapper for safe command handling
const safeHandler = (handler) => {
  return async (msg, match) => {
    const startTime = Date.now();
    const chatId = msg.chat.id;
    const userId = msg.from ? msg.from.id : null;
    
    try {
      logger.userAction(userId, 'command', {
        command: msg.text,
        chat_id: chatId
      });
      
      await handler(msg, match);
      
      const duration = Date.now() - startTime;
      
      // Record metrics
      healthMonitor.recordRequest(true, duration);
      
      logger.performance('command_handler', duration, {
        command: msg.text,
        user_id: userId
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record error and metrics
      healthMonitor.recordRequest(false, duration);
      healthMonitor.recordError(error);
      
      const errorResponse = await errorHandler.handle(error, {
        user_id: userId,
        chat_id: chatId,
        command: msg.text
      });
      
      try {
        await bot.sendMessage(chatId, errorResponse.error.message);
      } catch (sendError) {
        logger.error('Failed to send error message', sendError);
      }
    }
  };
};

// Bot commands and handlers
bot.onText(/\/start/, safeHandler(async (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🌍 مرحباً بك في Maya Trips!

أنا مساعد السفر الذكي الذي سيساعدك في:

✈️ تخطيط رحلاتك المثالية
💰 إدارة ميزانيتك بذكاء
🗺️ اكتشاف وجهات جديدة
🔗 إنشاء روابط دفع آمنة
🤖 نصائح سفر شخصية

🚀 ابدأ الآن:
/start - بدء المحادثة
/payment - إنشاء رابط دفع
/trip - تخطيط رحلة جديدة
/help - المساعدة

💬 متاح 24/7 لخدمتك!
  `;
  
  await bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🚀 تخطيط رحلة جديدة', callback_data: 'new_trip' },
          { text: '💰 إدارة الميزانية', callback_data: 'budget' }
        ],
        [
          { text: '💳 الدفع', callback_data: 'payment' },
          { text: '❓ المساعدة', callback_data: 'help' }
        ],
        [
          { text: '📊 الإحصائيات', callback_data: 'stats' },
          { text: '⚙️ الإعدادات', callback_data: 'settings' }
        ],
        [
          { text: '🌐 فتح التطبيق', web_app: { url: process.env.WEB_APP_URL || 'http://localhost:3000' } }
        ]
      ]
    }
  });
}));

bot.onText(/\/help/, safeHandler(async (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
🆘 مساعدة Maya Trips

الأوامر المتاحة:
/start - بدء المحادثة
/help - عرض هذه المساعدة
/payment - إنشاء رابط دفع آمن
/trip - تخطيط رحلة جديدة
/budget - إدارة الميزانية
/status - حالة الحساب
/support - التواصل مع الدعم الفني

🔗 روابط الدفع:
• إنشاء روابط دفع آمنة مع Stripe
• دعم جميع بطاقات الائتمان
• حماية SSL متقدمة
• تأكيد فوري للدفع

📞 الدعم الفني:
📧 support@mayatrips.com
💬 @MayaTripsSupport
  `;
  
  await bot.sendMessage(chatId, helpMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '💳 إنشاء رابط دفع', callback_data: 'payment' },
          { text: '🚀 تخطيط رحلة', callback_data: 'new_trip' }
        ],
        [
          { text: '📞 الدعم الفني', callback_data: 'support' },
          { text: '📊 الإحصائيات', callback_data: 'stats' }
        ]
      ]
    }
  });
}));

bot.onText(/\/payment/, safeHandler(async (msg) => {
  const chatId = msg.chat.id;
  const paymentMessage = `
💳 نظام الدفع الآمن - Maya Trips

🔗 إنشاء روابط دفع آمنة مع Stripe:

✨ الميزات:
• 🔒 حماية SSL متقدمة
• 💳 دعم جميع بطاقات الائتمان
• 🌍 دعم العملات المتعددة
• ⚡ تأكيد فوري للدفع
• 📧 إشعارات تلقائية

أدخل المبلغ المطلوب:
مثال: 100.50
  `;
  
  await bot.sendMessage(chatId, paymentMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔗 رابط دفع Stripe', callback_data: 'payment_stripe' },
          { text: '💳 دفع مباشر', callback_data: 'payment_direct' }
        ],
        [
          { text: '🅿️ PayPal', callback_data: 'payment_paypal' },
          { text: '📱 Telegram', callback_data: 'payment_telegram' }
        ],
        [
          { text: '❓ المساعدة', callback_data: 'help' }
        ]
      ]
    }
  });
}));

// Handle payment amount input
bot.onText(/^(\d+(?:\.\d{1,2})?)$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const amount = parseFloat(match[1]);
  
  if (amount > 0 && amount <= 10000) {
    const paymentMessage = `
💳 تأكيد الدفع

المبلغ: $${amount.toFixed(2)}
الوصف: Maya Trips Payment

اختر طريقة الدفع:
    `;
    
    await bot.sendMessage(chatId, paymentMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔗 رابط دفع Stripe', callback_data: `link_stripe_${amount}` },
            { text: '💳 دفع مباشر', callback_data: `pay_stripe_${amount}` }
          ],
          [
            { text: '🅿️ PayPal', callback_data: `pay_paypal_${amount}` },
            { text: '📱 Telegram', callback_data: `pay_telegram_${amount}` }
          ]
        ]
      }
    });
  } else {
    bot.sendMessage(chatId, '❌ المبلغ غير صحيح. يرجى إدخال مبلغ بين $0.01 و $10,000');
  }
});

// Handle callback queries
bot.on('callback_query', safeHandler(async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  const userId = callbackQuery.from.id;
  
  if (data === 'new_trip') {
      await conversationManager.setState(userId, conversationManager.states.COLLECTING_DESTINATION);
      await bot.sendMessage(chatId, '🚀 تخطيط رحلة جديدة\n\nأين تريد الذهاب؟', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🌍 أوروبا', callback_data: 'trip_europe' },
              { text: '🌏 آسيا', callback_data: 'trip_asia' }
            ],
            [
              { text: '🌎 أمريكا', callback_data: 'trip_america' },
              { text: '🌍 أفريقيا', callback_data: 'trip_africa' }
            ]
          ]
        }
      });
    } else if (data.startsWith('trip_')) {
      const region = data.replace('trip_', '');
      const regionNames = {
        europe: 'أوروبا',
        asia: 'آسيا',
        america: 'أمريكا',
        africa: 'أفريقيا'
      };
      
      const regionName = regionNames[region] || region;
      await conversationManager.setState(userId, conversationManager.states.COLLECTING_DATES, { destination: regionName });
      
      // Get AI insights about the region
      const insights = await zaiClient.generateDestinationInsights(regionName, 'leisure');
      
      let message = `✈️ اخترت ${regionName}! رائع!\n\n`;
      if (insights.success) {
        message += `${insights.content.substring(0, 500)}...\n\n`;
      }
      message += '📅 متى تخطط للسفر؟';
      
      await bot.sendMessage(chatId, message);
    } else if (data.startsWith('dest_')) {
      const dest = data.replace('dest_', '');
      const destNames = {
        turkey: 'تركيا',
        dubai: 'دبي',
        malaysia: 'ماليزيا',
        thailand: 'تايلاند'
      };
      
      const destName = destNames[dest] || dest;
      await conversationManager.setState(userId, conversationManager.states.COLLECTING_DATES, { destination: destName });
      
      // Get AI insights
      const insights = await zaiClient.generateDestinationInsights(destName, 'leisure');
      
      let message = `✈️ اخترت ${destName}! رائع!\n\n`;
      if (insights.success) {
        message += `${insights.content.substring(0, 500)}...\n\n`;
      }
      message += '📅 متى تخطط للسفر؟';
      
      await bot.sendMessage(chatId, message);
    } else if (data === 'budget') {
      await conversationManager.setState(userId, conversationManager.states.COLLECTING_BUDGET);
      await bot.sendMessage(chatId, '💰 إدارة الميزانية\n\nما هو ميزانيتك للسفر؟', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '💵 أقل من $500', callback_data: 'budget_low' },
              { text: '💵 $500-1000', callback_data: 'budget_medium' }
            ],
            [
              { text: '💵 $1000-3000', callback_data: 'budget_high' },
              { text: '💵 أكثر من $3000', callback_data: 'budget_premium' }
            ]
          ]
        }
      });
    } else if (data.startsWith('budget_')) {
      const budgetLevel = data.replace('budget_', '');
      const budgetRanges = {
        low: 'أقل من $500',
        medium: '$500-1000',
        high: '$1000-3000',
        premium: 'أكثر من $3000'
      };
      
      const budgetRange = budgetRanges[budgetLevel] || budgetLevel;
      await conversationManager.setState(userId, conversationManager.states.COLLECTING_PREFERENCES, { budget: budgetRange });
      
      // Get AI budget analysis
      const context = await conversationManager.getContext(userId);
      if (context.data.destination) {
        const analysis = await zaiClient.generateBudgetAnalysis({
          destination: context.data.destination,
          duration: 7,
          travelers: 1
        }, budgetLevel === 'low' ? 500 : budgetLevel === 'medium' ? 750 : budgetLevel === 'high' ? 2000 : 5000);
        
        let message = `💰 ميزانيتك: ${budgetRange}\n\n`;
        if (analysis.success) {
          message += `${analysis.content.substring(0, 600)}...\n\n`;
        }
        message += '🎯 ما هي اهتماماتك؟ (مثال: شواطئ، مغامرات، ثقافة)';
        
        await bot.sendMessage(chatId, message);
      } else {
        await bot.sendMessage(chatId, '🎯 ما هي اهتماماتك؟ (مثال: شواطئ، مغامرات، ثقافة)');
      }
    } else if (data === 'payment') {
      bot.sendMessage(chatId, '💳 نظام الدفع الآمن\n\nأدخل المبلغ المطلوب:');
    } else if (data === 'help') {
      bot.sendMessage(chatId, '❓ المساعدة\n\nكيف يمكنني مساعدتك؟');
    } else if (data === 'support') {
      bot.sendMessage(chatId, '📞 الدعم الفني\n\nتواصل معنا:\n📧 support@mayatrips.com\n💬 @MayaTripsSupport');
    } else if (data === 'stats') {
      const userSummary = await conversationManager.getSummary(userId);
      const systemStats = healthMonitor.getMetricsSummary();
      
      const statsMessage = `📊 إحصائياتك\n\n` +
        `💬 عدد الرسائل: ${userSummary.messageCount}\n` +
        `⏱️ مدة الجلسة: ${Math.floor(userSummary.sessionDuration / 60000)} دقيقة\n` +
        `📝 البيانات المجمعة: ${userSummary.dataCollected} عنصر\n` +
        `\n🤖 حالة النظام:\n` +
        `✅ الحالة: ${systemStats.status === 'healthy' ? 'جيد' : 'متدهور'}\n` +
        `⏰ وقت التشغيل: ${systemStats.uptime}\n` +
        `📈 معدل النجاح: ${systemStats.successRate}`;
      
      await bot.sendMessage(chatId, statsMessage);
    } else if (data === 'health') {
      const health = healthMonitor.getHealth();
      const healthMessage = `🏥 حالة النظام\n\n` +
        `الحالة العامة: ${health.status === 'healthy' ? '✅ جيد' : '⚠️ متدهور'}\n` +
        `وقت التشغيل: ${health.uptime.formatted}\n\n` +
        `📡 حالة الخدمات:\n` +
        `• Z.ai: ${health.apis.zai.status === 'healthy' ? '✅' : '❌'} (${health.apis.zai.responseTime}ms)\n` +
        `• Telegram: ${health.apis.telegram.status === 'healthy' ? '✅' : '❌'} (${health.apis.telegram.responseTime}ms)\n` +
        `• Supabase: ${health.apis.supabase.status === 'healthy' ? '✅' : '❌'} (${health.apis.supabase.responseTime}ms)\n\n` +
        `📊 الأداء:\n` +
        `• إجمالي الطلبات: ${health.requests.total}\n` +
        `• الناجحة: ${health.requests.successful}\n` +
        `• الفاشلة: ${health.requests.failed}\n` +
        `• متوسط وقت الاستجابة: ${health.performance.avgResponseTime.toFixed(2)}ms`;
      
      await bot.sendMessage(chatId, healthMessage);
    } else if (data === 'settings') {
      bot.sendMessage(chatId, '⚙️ الإعدادات\n\n🔔 الإشعارات: مفعلة\n🌍 اللغة: العربية\n💰 العملة: USD');
    } else if (data.startsWith('link_stripe_')) {
      const [, , , amount] = data.split('_');
      const paymentAmount = parseFloat(amount);
      
      try {
        // Create Stripe payment link
        const response = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/payment/create-payment-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: paymentAmount,
            currency: 'USD',
            description: 'Maya Trips Payment',
            customerEmail: callbackQuery.from.email
          }),
        });

        const result = await response.json();
        
        if (result.success && result.paymentLink) {
          const linkMessage = `
🔗 تم إنشاء رابط الدفع بنجاح!

المبلغ: $${paymentAmount.toFixed(2)}
الرابط: ${result.paymentLink.url}

شارك هذا الرابط مع العميل لإتمام الدفع.
          `;
          
          bot.sendMessage(chatId, linkMessage, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔗 فتح الرابط', url: result.paymentLink.url }
                ],
                [
                  { text: '📋 نسخ الرابط', callback_data: `copy_link_${result.paymentLink.id}` }
                ]
              ]
            }
          });
        } else {
          bot.sendMessage(chatId, `❌ خطأ في إنشاء رابط الدفع: ${result.error}`);
        }
      } catch (error) {
        bot.sendMessage(chatId, '❌ خطأ في الشبكة. يرجى المحاولة مرة أخرى.');
      }
    } else if (data.startsWith('pay_')) {
      const [, method, amount] = data.split('_');
      const paymentAmount = parseFloat(amount);
      
      // Create payment
      const paymentResult = await PaymentService.createTelegramPayment(
        paymentAmount,
        'Maya Trips Payment',
        chatId.toString()
      );
      
      if (paymentResult.success) {
        const successMessage = `
✅ تم إنشاء الدفع بنجاح!

معرف الدفع: ${paymentResult.data.id}
المبلغ: $${paymentAmount.toFixed(2)}
الحالة: ${paymentResult.data.status}

سيتم تأكيد الدفع قريباً.
        `;
        
        bot.sendMessage(chatId, successMessage);
      } else {
        bot.sendMessage(chatId, `❌ خطأ في الدفع: ${paymentResult.error}`);
      }
    }
  
  // Answer callback query
  await bot.answerCallbackQuery(callbackQuery.id);
}));

// Handle text messages with conversation management
bot.on('text', safeHandler(async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  // Skip if it's a command
  if (text.startsWith('/')) return;
  
  // Skip if it's a number (payment amount)
  if (/^(\d+(?:\.\d{1,2})?)$/.test(text)) return;
  
  // Add message to conversation history
  await conversationManager.addMessage(userId, text, true);
  
  // Get next action based on context
  const nextAction = await conversationManager.getNextAction(userId, text);
  
  // Update state
  if (nextAction.data) {
    await conversationManager.setState(userId, nextAction.nextState, nextAction.data);
  }
  
  // Generate response based on action
  let response = '';
  let keyboard = null;
  
  switch (nextAction.action) {
    case 'greet':
      response = '👋 مرحباً بك في Maya Trips! كيف يمكنني مساعدتك اليوم؟';
      keyboard = {
        inline_keyboard: [
          [
            { text: '🚀 تخطيط رحلة', callback_data: 'new_trip' },
            { text: '💰 الميزانية', callback_data: 'budget' }
          ],
          [
            { text: '🎁 العروض', callback_data: 'offers' },
            { text: '❓ المساعدة', callback_data: 'help' }
          ]
        ]
      };
      break;
      
    case 'ask_destination':
      response = '🌍 رائع! إلى أين تريد السفر؟\n\nيمكنك اختيار من الوجهات الشائعة أو كتابة وجهتك المفضلة:';
      keyboard = {
        inline_keyboard: [
          [
            { text: '🇹🇷 تركيا', callback_data: 'dest_turkey' },
            { text: '🇦🇪 دبي', callback_data: 'dest_dubai' }
          ],
          [
            { text: '🇲🇾 ماليزيا', callback_data: 'dest_malaysia' },
            { text: '🇹🇭 تايلاند', callback_data: 'dest_thailand' }
          ]
        ]
      };
      break;
      
    case 'collect_dates':
      response = `✈️ ممتاز! اخترت ${nextAction.data.destination}\n\n📅 متى تخطط للسفر؟\nمثال: من 15 يناير إلى 25 يناير`;
      break;
      
    case 'collect_budget':
      response = '💰 ما هي ميزانيتك التقريبية للرحلة؟';
      keyboard = {
        inline_keyboard: [
          [
            { text: '💵 أقل من $500', callback_data: 'budget_low' },
            { text: '💵 $500-1000', callback_data: 'budget_medium' }
          ],
          [
            { text: '💵 $1000-3000', callback_data: 'budget_high' },
            { text: '💵 أكثر من $3000', callback_data: 'budget_premium' }
          ]
        ]
      };
      break;
      
    case 'collect_preferences':
      response = '🎯 ما هي اهتماماتك في السفر؟\n\nمثال: شواطئ، مغامرات، ثقافة، تسوق';
      break;
      
    case 'generate_plan':
      response = '⏳ جاري إنشاء خطة رحلتك المثالية...\n\nسأقوم بتحليل تفضيلاتك وإنشاء أفضل خطة لك!';
      
      // Send initial message
      await bot.sendMessage(chatId, response);
      
      // Update profile from conversation
      await conversationManager.updateProfileFromConversation(userId);
      
      // Get context for AI generation
      const context = await conversationManager.getContext(userId);
      const { destination, dates, budget, preferences } = context.data;
      
      // Generate AI-powered recommendations using Z.ai
      const aiResponse = await zaiClient.generateTravelRecommendations(
        destination || 'وجهة غير محددة',
        budget || 'ميزانية متوسطة',
        dates || '7 أيام',
        preferences ? [preferences] : []
      );
      
      if (aiResponse.success) {
        response = `🎯 خطة رحلتك المخصصة:\n\n${aiResponse.content}`;
      } else {
        response = '⚠️ حدث خطأ في إنشاء الخطة. دعني أعرض لك بعض العروض المتاحة...';
      }
      
      // Get recommendations
      const recommendations = await conversationManager.getRecommendations(userId);
      
      if (recommendations.length > 0) {
        const offer = recommendations[0];
        response += `\n\n🎁 لدي عرض رائع لك:\n\n`;
        response += `📍 ${offer.title}\n`;
        response += `💰 السعر: $${offer.price} (خصم ${offer.discount_percentage}%)\n`;
        response += `⏱️ المدة: ${offer.duration_days} أيام\n`;
        response += `\n✨ يشمل:\n${offer.includes.map(item => `• ${item}`).join('\n')}`;
        
        keyboard = {
          inline_keyboard: [
            [
              { text: '✅ أعجبني', callback_data: `offer_like_${offer.id}` },
              { text: '💳 احجز الآن', callback_data: `offer_book_${offer.id}` }
            ],
            [
              { text: '🔍 عروض أخرى', callback_data: 'more_offers' }
            ]
          ]
        };
      }
      break;
      
    case 'clarify_destination':
      response = '🤔 لم أفهم الوجهة بشكل واضح. هل يمكنك اختيار من القائمة أو كتابة اسم المدينة/البلد بوضوح؟';
      keyboard = {
        inline_keyboard: [
          [
            { text: '🇹🇷 تركيا', callback_data: 'dest_turkey' },
            { text: '🇦🇪 دبي', callback_data: 'dest_dubai' }
          ],
          [
            { text: '🇲🇾 ماليزيا', callback_data: 'dest_malaysia' },
            { text: '🇹🇭 تايلاند', callback_data: 'dest_thailand' }
          ]
        ]
      };
      break;
      
    default:
      // Use Z.ai for general conversation
      const history = await conversationManager.getHistory(userId, 10);
      const conversationHistory = history.map(h => ({
        role: h.is_user ? 'user' : 'assistant',
        content: h.message
      }));
      
      const generalAiResponse = await zaiClient.generateChatResponse(text, conversationHistory);
      
      if (generalAiResponse.success) {
        response = generalAiResponse.content;
      } else {
        response = 'شكراً لرسالتك! كيف يمكنني مساعدتك؟';
        keyboard = {
          inline_keyboard: [
            [
              { text: '🚀 تخطيط رحلة', callback_data: 'new_trip' },
              { text: '❓ المساعدة', callback_data: 'help' }
            ]
          ]
        };
      }
  }
  
  // Send response
  await bot.sendMessage(chatId, response, keyboard ? { reply_markup: keyboard } : {});
  
  // Add bot response to history
  await conversationManager.addMessage(userId, response, false);
}));

// Handle successful payments
bot.on('message', safeHandler(async (msg) => {
  if (msg.successful_payment) {
    const chatId = msg.chat.id;
    const payment = msg.successful_payment;
    
    const successMessage = `
🎉 تم الدفع بنجاح!

المبلغ: $${(payment.total_amount / 100).toFixed(2)}
العملة: ${payment.currency}
معرف الدفع: ${payment.telegram_payment_charge_id}

شكراً لاستخدام Maya Trips! 🚀
    `;
    
    await bot.sendMessage(chatId, successMessage);
  }
}));

// Graceful shutdown
errorHandler.setupGracefulShutdown(async () => {
  logger.info('Stopping Telegram bot...');
  await bot.stopPolling();
  logger.info('Bot stopped successfully');
});

// Perform initial health checks
(async () => {
  logger.info('Performing initial health checks...');
  
  await healthMonitor.checkTelegramHealth(bot);
  await healthMonitor.checkZaiHealth();
  await healthMonitor.checkSupabaseHealth();
  
  const health = healthMonitor.getHealth();
  logger.info('Initial health check complete', {
    status: health.status,
    apis: Object.keys(health.apis).map(key => ({
      name: key,
      status: health.apis[key].status
    }))
  });
  
  if (health.status === 'degraded') {
    logger.warn('⚠️ System started with degraded health');
  } else {
    logger.info('✅ All systems operational');
  }
})();

// Start bot
logger.info('🤖 Telegram Bot started successfully!');
logger.info('Bot is listening for messages...');

module.exports = bot;
