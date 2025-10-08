/**
 * Maya Travel Agent - Telegram Bot (No AI Version)
 * Works without Z.ai API - Uses predefined responses
 */

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Enterprise-grade utilities
const logger = require('./utils/logger');
const { errorHandler } = require('./utils/errorHandler');
const conversationManager = require('./utils/conversationManager');
const healthMonitor = require('./utils/healthMonitor');

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

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
      healthMonitor.recordRequest(true, duration);
      
      logger.performance('command_handler', duration, {
        command: msg.text,
        user_id: userId
      });
    } catch (error) {
      const duration = Date.now() - startTime;
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

// Predefined responses (no AI needed)
const responses = {
  destinations: {
    'تركيا': '🇹🇷 تركيا وجهة رائعة!\n\n✨ أفضل الأماكن:\n• إسطنبول - المدينة التي تجمع بين الشرق والغرب\n• كابادوكيا - المناظر الطبيعية الخلابة\n• أنطاليا - الشواطئ الجميلة\n\n💰 الميزانية المقترحة: $1000-2000 لمدة أسبوع\n📅 أفضل وقت: أبريل-يونيو أو سبتمبر-نوفمبر',
    'دبي': '🇦🇪 دبي - مدينة المستقبل!\n\n✨ أفضل الأماكن:\n• برج خليفة - أطول برج في العالم\n• دبي مول - أكبر مول تجاري\n• نخلة جميرا - جزيرة اصطناعية\n\n💰 الميزانية المقترحة: $1500-3000 لمدة أسبوع\n📅 أفضل وقت: نوفمبر-مارس',
    'ماليزيا': '🇲🇾 ماليزيا - آسيا الساحرة!\n\n✨ أفضل الأماكن:\n• كوالالمبور - العاصمة الحديثة\n• لنكاوي - جزيرة الأحلام\n• بينانج - الطعام والثقافة\n\n💰 الميزانية المقترحة: $800-1500 لمدة أسبوع\n📅 أفضل وقت: ديسمبر-فبراير',
    'تايلاند': '🇹🇭 تايلاند - أرض الابتسامات!\n\n✨ أفضل الأماكن:\n• بانكوك - العاصمة النابضة\n• بوكيت - الشواطئ الاستوائية\n• شيانغ ماي - الثقافة والطبيعة\n\n💰 الميزانية المقترحة: $700-1200 لمدة أسبوع\n📅 أفضل وقت: نوفمبر-فبراير'
  },
  
  budgetAdvice: {
    low: '💰 ميزانية اقتصادية (أقل من $500)\n\n✅ نصائح:\n• اختر hostels أو فنادق 2-3 نجوم\n• استخدم المواصلات العامة\n• تناول الطعام في المطاعم المحلية\n• ابحث عن الأنشطة المجانية\n• احجز مبكراً للحصول على أفضل الأسعار',
    medium: '💰 ميزانية متوسطة ($500-1000)\n\n✅ نصائح:\n• فنادق 3-4 نجوم\n• مزيج من المواصلات العامة والخاصة\n• تنوع في المطاعم\n• بعض الأنشطة المدفوعة\n• خطط جيداً للحصول على قيمة أفضل',
    high: '💰 ميزانية مريحة ($1000-3000)\n\n✅ نصائح:\n• فنادق 4-5 نجوم\n• مواصلات خاصة\n• مطاعم راقية\n• جميع الأنشطة السياحية\n• تجارب فاخرة',
    premium: '💰 ميزانية فاخرة (أكثر من $3000)\n\n✅ نصائح:\n• فنادق 5 نجوم فاخرة\n• سائق خاص\n• مطاعم عالمية\n• تجارب VIP\n• خدمات كونسيرج'
  }
};

// /start command
bot.onText(/\/start/, safeHandler(async (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🌍 مرحباً بك في Maya Trips!

أنا مساعد السفر الذكي الذي سيساعدك في:

✈️ تخطيط رحلاتك المثالية
💰 إدارة ميزانيتك بذكاء
🗺️ اكتشاف وجهات جديدة
🤖 نصائح سفر شخصية

🚀 ابدأ الآن:
  `;
  
  await bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🚀 تخطيط رحلة جديدة', callback_data: 'new_trip' },
          { text: '💰 إدارة الميزانية', callback_data: 'budget' }
        ],
        [
          { text: '🎁 العروض المتاحة', callback_data: 'offers' },
          { text: '❓ المساعدة', callback_data: 'help' }
        ],
        [
          { text: '📊 الإحصائيات', callback_data: 'stats' },
          { text: '🏥 حالة النظام', callback_data: 'health' }
        ]
      ]
    }
  });
}));

// /help command
bot.onText(/\/help/, safeHandler(async (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
🆘 مساعدة Maya Trips

الأوامر المتاحة:
/start - بدء المحادثة
/help - عرض هذه المساعدة
/trip - تخطيط رحلة جديدة
/budget - إدارة الميزانية
/stats - عرض إحصائياتك

💬 يمكنك أيضاً:
• كتابة اسم وجهة سفر
• السؤال عن الميزانية
• طلب نصائح السفر

📞 الدعم الفني:
📧 support@mayatrips.com
💬 @MayaTripsSupport
  `;
  
  await bot.sendMessage(chatId, helpMessage);
}));

// Handle text messages
bot.on('text', safeHandler(async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  // Skip commands
  if (text.startsWith('/')) return;
  
  // Add to conversation history
  await conversationManager.addMessage(userId, text, true);
  
  // Check for destination keywords
  let response = '';
  let keyboard = null;
  
  if (text.includes('تركيا') || text.toLowerCase().includes('turkey')) {
    response = responses.destinations['تركيا'];
  } else if (text.includes('دبي') || text.toLowerCase().includes('dubai')) {
    response = responses.destinations['دبي'];
  } else if (text.includes('ماليزيا') || text.toLowerCase().includes('malaysia')) {
    response = responses.destinations['ماليزيا'];
  } else if (text.includes('تايلاند') || text.toLowerCase().includes('thailand')) {
    response = responses.destinations['تايلاند'];
  } else if (text.includes('ميزانية') || text.includes('سعر') || text.includes('تكلفة')) {
    response = '💰 دعني أساعدك في تخطيط ميزانيتك!\n\nاختر نطاق ميزانيتك:';
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
  } else {
    response = '👋 شكراً لرسالتك!\n\nكيف يمكنني مساعدتك اليوم؟';
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
  }
  
  await bot.sendMessage(chatId, response, keyboard ? { reply_markup: keyboard } : {});
  await conversationManager.addMessage(userId, response, false);
}));

// Handle callback queries
bot.on('callback_query', safeHandler(async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;
  
  let message = '';
  let keyboard = null;
  
  if (data === 'new_trip') {
    message = '🚀 تخطيط رحلة جديدة\n\nاختر وجهتك المفضلة:';
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
  } else if (data.startsWith('dest_')) {
    const destMap = {
      turkey: 'تركيا',
      dubai: 'دبي',
      malaysia: 'ماليزيا',
      thailand: 'تايلاند'
    };
    const dest = destMap[data.replace('dest_', '')];
    message = responses.destinations[dest];
  } else if (data === 'budget') {
    message = '💰 إدارة الميزانية\n\nاختر نطاق ميزانيتك:';
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
  } else if (data.startsWith('budget_')) {
    const level = data.replace('budget_', '');
    message = responses.budgetAdvice[level];
  } else if (data === 'stats') {
    const summary = await conversationManager.getSummary(userId);
    const systemStats = healthMonitor.getMetricsSummary();
    
    message = `📊 إحصائياتك\n\n` +
      `💬 عدد الرسائل: ${summary.messageCount}\n` +
      `⏱️ مدة الجلسة: ${Math.floor(summary.sessionDuration / 60000)} دقيقة\n` +
      `\n🤖 حالة النظام:\n` +
      `✅ الحالة: ${systemStats.status === 'healthy' ? 'جيد' : 'يعمل'}\n` +
      `⏰ وقت التشغيل: ${systemStats.uptime}`;
  } else if (data === 'health') {
    const health = healthMonitor.getHealth();
    message = `🏥 حالة النظام\n\n` +
      `الحالة: ${health.status === 'healthy' ? '✅ جيد' : '⚠️ يعمل'}\n` +
      `وقت التشغيل: ${health.uptime.formatted}\n\n` +
      `📡 الخدمات:\n` +
      `• Telegram: ${health.apis.telegram.status === 'healthy' ? '✅' : '⚠️'}\n` +
      `• Database: ${health.apis.supabase.status === 'healthy' ? '✅' : '⚠️'}\n\n` +
      `📊 الأداء:\n` +
      `• الطلبات: ${health.requests.total}\n` +
      `• النجاح: ${health.requests.successful}`;
  } else {
    message = 'شكراً! كيف يمكنني مساعدتك؟';
  }
  
  await bot.sendMessage(chatId, message, keyboard ? { reply_markup: keyboard } : {});
  await bot.answerCallbackQuery(callbackQuery.id);
}));

// Graceful shutdown
errorHandler.setupGracefulShutdown(async () => {
  logger.info('Stopping Telegram bot...');
  await bot.stopPolling();
  logger.info('Bot stopped successfully');
});

// Perform initial health check
(async () => {
  logger.info('Performing initial health checks...');
  await healthMonitor.checkTelegramHealth(bot);
  await healthMonitor.checkSupabaseHealth();
  
  const health = healthMonitor.getHealth();
  logger.info('Initial health check complete', {
    status: health.status,
    telegram: health.apis.telegram.status,
    database: health.apis.supabase.status
  });
})();

// Start bot
logger.info('🤖 Maya Travel Bot started successfully (No AI mode)!');
logger.info('Bot is listening for messages...');
logger.info('Note: Running without Z.ai - using predefined responses');

module.exports = bot;
