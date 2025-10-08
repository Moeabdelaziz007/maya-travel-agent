const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Payment service integration
const PaymentService = require('./routes/payment');

// Bot commands and handlers
bot.onText(/\/start/, (msg) => {
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
  
  bot.sendMessage(chatId, welcomeMessage, {
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
});

bot.onText(/\/help/, (msg) => {
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
  
  bot.sendMessage(chatId, helpMessage, {
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
});

bot.onText(/\/payment/, (msg) => {
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
  
  bot.sendMessage(chatId, paymentMessage, {
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
});

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
    
    bot.sendMessage(chatId, paymentMessage, {
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
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  try {
    if (data === 'new_trip') {
      bot.sendMessage(chatId, '🚀 تخطيط رحلة جديدة\n\nأين تريد الذهاب؟', {
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
    } else if (data === 'budget') {
      bot.sendMessage(chatId, '💰 إدارة الميزانية\n\nما هو ميزانيتك للسفر؟', {
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
    } else if (data === 'payment') {
      bot.sendMessage(chatId, '💳 نظام الدفع الآمن\n\nأدخل المبلغ المطلوب:');
    } else if (data === 'help') {
      bot.sendMessage(chatId, '❓ المساعدة\n\nكيف يمكنني مساعدتك؟');
    } else if (data === 'support') {
      bot.sendMessage(chatId, '📞 الدعم الفني\n\nتواصل معنا:\n📧 support@mayatrips.com\n💬 @MayaTripsSupport');
    } else if (data === 'stats') {
      bot.sendMessage(chatId, '📊 إحصائياتك\n\n🚀 الرحلات المخططة: 0\n💰 إجمالي الميزانية: $0\n🎯 الوجهات المفضلة: لا توجد');
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
            description: 'Maya Trips Payment'
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
    bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.error('Error handling callback query:', error);
    bot.sendMessage(chatId, '❌ حدث خطأ. يرجى المحاولة مرة أخرى.');
  }
});

// Handle successful payments
bot.on('message', async (msg) => {
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
    
    bot.sendMessage(chatId, successMessage);
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('Telegram Bot Error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Telegram Bot Polling Error:', error);
});

// Start bot
console.log('🤖 Telegram Bot started successfully!');
console.log('Bot is listening for messages...');

module.exports = bot;
