/**
 * WhatsApp Webhook Routes
 * Handle incoming messages and webhook verification
 */

const express = require('express');
const router = express.Router();
const WhatsAppClient = require('../src/whatsapp/whatsappClient');
const ZaiClient = require('../src/ai/zaiClient');

const whatsappClient = new WhatsAppClient();
const zaiClient = new ZaiClient();

// Store conversation history (in production, use database)
const conversations = new Map();

/**
 * Webhook verification (GET)
 * WhatsApp will call this to verify your webhook
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'maya_whatsapp_webhook_2024';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    console.error('❌ WhatsApp webhook verification failed');
    res.sendStatus(403);
  }
});

/**
 * Webhook endpoint (POST)
 * Receive incoming messages from WhatsApp
 */
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Respond quickly to WhatsApp
    res.sendStatus(200);

    // Check if this is a WhatsApp message
    if (body.object !== 'whatsapp_business_account') {
      return;
    }

    // Process each entry
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        
        // Handle messages
        if (value.messages) {
          for (const message of value.messages) {
            await handleIncomingMessage(message, value.metadata);
          }
        }

        // Handle message status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            handleMessageStatus(status);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ WhatsApp Webhook Error:', error);
  }
});

/**
 * Handle incoming message
 */
async function handleIncomingMessage(message, metadata) {
  try {
    const from = message.from;
    const messageId = message.id;
    const timestamp = message.timestamp;

    console.log(`📱 WhatsApp message from ${from}`);

    // Mark as read
    await whatsappClient.markAsRead(messageId);

    // Get message text
    let messageText = '';
    
    if (message.type === 'text') {
      messageText = message.text.body;
    } else if (message.type === 'button') {
      messageText = message.button.text;
    } else if (message.type === 'interactive') {
      if (message.interactive.type === 'button_reply') {
        messageText = message.interactive.button_reply.title;
      } else if (message.interactive.type === 'list_reply') {
        messageText = message.interactive.list_reply.title;
      }
    } else {
      // Unsupported message type
      await whatsappClient.sendMessage(from, 'عذراً، هذا النوع من الرسائل غير مدعوم حالياً. يرجى إرسال رسالة نصية.');
      return;
    }

    // Handle commands
    if (messageText.toLowerCase() === '/start' || messageText.toLowerCase() === 'start') {
      await handleStartCommand(from);
      return;
    }

    if (messageText.toLowerCase() === '/help' || messageText.toLowerCase() === 'مساعدة') {
      await handleHelpCommand(from);
      return;
    }

    // Get conversation history
    let history = conversations.get(from) || [];

    // Prepare messages for AI
    const aiMessages = [
      { 
        role: 'system', 
        content: 'أنت مايا، مساعدة سفر ذكية ومحترفة عبر WhatsApp. تتحدثين العربية بطلاقة وتساعدين المسافرين في تخطيط رحلاتهم. كوني ودودة ومفيدة وموجزة. الرسائل عبر WhatsApp يجب أن تكون قصيرة ومباشرة.' 
      },
      ...history.slice(-10),
      { role: 'user', content: messageText }
    ];

    // Get AI response
    const aiResponse = await zaiClient.chatCompletion(aiMessages, {
      maxTokens: 500,
      temperature: 0.7
    });

    if (aiResponse.success) {
      // Save to history
      history.push(
        { role: 'user', content: messageText },
        { role: 'assistant', content: aiResponse.content }
      );
      conversations.set(from, history.slice(-20));

      // Send response
      await whatsappClient.sendMessage(from, aiResponse.content);
    } else {
      await whatsappClient.sendMessage(from, 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.');
    }

  } catch (error) {
    console.error('❌ Error handling message:', error);
  }
}

/**
 * Handle /start command
 */
async function handleStartCommand(from) {
  const welcomeMessage = `🌍 مرحباً! أنا مايا، مساعدتك الذكية للسفر ✨

🧠 أنا هنا لمساعدتك في:
• 📍 تخطيط رحلات مثالية
• 💰 تحليل الميزانية
• 🏨 توصيات الفنادق
• 🍽️ مطاعم حلال

اسألني أي سؤال عن السفر!`;

  const buttons = [
    { id: 'plan_trip', title: '🚀 تخطيط رحلة' },
    { id: 'destinations', title: '🌍 وجهات مقترحة' },
    { id: 'help', title: '❓ مساعدة' }
  ];

  await whatsappClient.sendInteractive(from, welcomeMessage, buttons);
}

/**
 * Handle /help command
 */
async function handleHelpCommand(from) {
  const helpMessage = `❓ كيف يمكنني مساعدتك؟

يمكنك:
• سؤالي عن أي وجهة سياحية
• طلب توصيات للفنادق والمطاعم
• الاستفسار عن الطقس
• تحليل ميزانية رحلتك

فقط اكتب سؤالك بشكل طبيعي!

الأوامر المتاحة:
/start - بداية جديدة
/help - المساعدة`;

  await whatsappClient.sendMessage(from, helpMessage);
}

/**
 * Handle message status updates
 */
function handleMessageStatus(status) {
  console.log(`📊 Message ${status.id} status: ${status.status}`);
  // You can track message delivery, read status, etc.
}

/**
 * Test endpoint
 */
router.post('/test', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, message'
      });
    }

    const result = await whatsappClient.sendMessage(to, message);
    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check
 */
router.get('/health', async (req, res) => {
  const health = await whatsappClient.healthCheck();
  res.json(health);
});

module.exports = router;
