const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Supabase service client (service role)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Verify Telegram initData per Telegram WebApp docs
function verifyTelegramInitData(initData, botToken) {
  try {
    if (!initData || !botToken) return null;
    const urlSearchParams = new URLSearchParams(initData);
    const hash = urlSearchParams.get('hash');
    urlSearchParams.delete('hash');
    const dataCheckString = Array.from(urlSearchParams.entries())
      .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computedHash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
    if (computedHash !== hash) return null;

    const userJson = urlSearchParams.get('user');
    const user = userJson ? JSON.parse(userJson) : null;
    return user;
  } catch (e) {
    return null;
  }
}

// Mini App service integration
class MiniAppService {
  // Send message to Telegram user
  static async sendMessage(message, chatId) {
    try {
      // This would integrate with Telegram Bot API
      const bot = require('../telegram-bot');
      
      if (bot && chatId) {
        await bot.sendMessage(chatId, message);
        return { success: true };
      }
      
      return { success: false, error: 'Bot not available or chat ID missing' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Send payment link to user
  static async sendPaymentLink(amount, description, chatId) {
    try {
      const PaymentService = require('./payment');
      
      // Create payment link
      const paymentResult = await PaymentService.createStripePayment(amount, 'USD', description);
      
      if (paymentResult.success) {
        // Send payment link to user
        const message = `💳 Payment Link Created!\n\nAmount: $${amount}\nDescription: ${description}\n\nLink: ${paymentResult.data.url}`;
        
        if (chatId) {
          const bot = require('../telegram-bot');
          if (bot) {
            await bot.sendMessage(chatId, message, {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '🔗 Open Payment Link', url: paymentResult.data.url }
                  ]
                ]
              }
            });
          }
        }
        
        return { success: true, paymentLink: paymentResult.data.url };
      }
      
      return { success: false, error: paymentResult.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Share trip with user
  static async shareTrip(tripData, chatId) {
    try {
      const message = `🗺️ Trip Shared!\n\nDestination: ${tripData.destination}\nDates: ${tripData.startDate} - ${tripData.endDate}\nBudget: $${tripData.budget}`;
      
      if (chatId) {
        const bot = require('../telegram-bot');
        if (bot) {
          await bot.sendMessage(chatId, message);
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user trips
  static async getUserTrips(userId) {
    try {
      // This would integrate with your database
      // For now, return mock data
      const trips = [
        {
          id: '1',
          destination: 'Tokyo, Japan',
          startDate: '2024-03-15',
          endDate: '2024-03-22',
          budget: 2500,
          status: 'planned'
        }
      ];
      
      return { success: true, trips };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sync user data
  static async syncUserData(userData) {
    try {
      // This would save user data to your database
      console.log('Syncing user data:', userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get bot commands
  static async getBotCommands() {
    try {
      const commands = [
        { command: 'start', description: 'Start the bot' },
        { command: 'help', description: 'Get help' },
        { command: 'payment', description: 'Create payment link' },
        { command: 'trip', description: 'Plan a trip' },
        { command: 'budget', description: 'Manage budget' }
      ];
      
      return { success: true, commands };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Send notification
  static async sendNotification(message, type, chatId) {
    try {
      const emoji = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
      };
      
      const formattedMessage = `${emoji[type]} ${message}`;
      
      if (chatId) {
        const bot = require('../telegram-bot');
        if (bot) {
          await bot.sendMessage(chatId, formattedMessage);
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Telegram WebApp auth via initData
router.post('/auth/telegram', async (req, res) => {
  try {
    const { initData } = req.body;
    const user = verifyTelegramInitData(initData, process.env.TELEGRAM_BOT_TOKEN);
    if (!user) {
      return res.status(401).json({ error: 'Invalid Telegram data' });
    }

    const { id, username, photo_url } = user;

    // Upsert profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({ telegram_id: id, username, avatar_url: photo_url })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Issue short-lived JWT with sub = telegram_id for RLS
    const token = jwt.sign(
      { sub: String(id) },
      process.env.JWT_SECRET || 'dev_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({ token, profile });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error', message: e.message });
  }
});

// Send message to user
router.post('/send-message', async (req, res) => {
  try {
    const { message, chat_id } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const result = await MiniAppService.sendMessage(message, chat_id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Message sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Send payment link to user
router.post('/send-payment-link', async (req, res) => {
  try {
    const { amount, description, chat_id } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required and must be greater than 0'
      });
    }

    const result = await MiniAppService.sendPaymentLink(amount, description, chat_id);
    
    if (result.success) {
      res.json({
        success: true,
        paymentLink: result.paymentLink,
        message: 'Payment link sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Share trip with user
router.post('/share-trip', async (req, res) => {
  try {
    const { trip, chat_id } = req.body;
    
    if (!trip) {
      return res.status(400).json({
        success: false,
        error: 'Trip data is required'
      });
    }

    const result = await MiniAppService.shareTrip(trip, chat_id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Trip shared successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get user trips
router.get('/user-trips', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    const result = await MiniAppService.getUserTrips(user_id);
    
    if (result.success) {
      res.json({
        success: true,
        trips: result.trips
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Sync user data
router.post('/sync-user', async (req, res) => {
  try {
    const userData = req.body;
    
    const result = await MiniAppService.syncUserData(userData);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'User data synced successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get bot commands
router.get('/bot-commands', async (req, res) => {
  try {
    const result = await MiniAppService.getBotCommands();
    
    if (result.success) {
      res.json({
        success: true,
        commands: result.commands
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Send notification
router.post('/send-notification', async (req, res) => {
  try {
    const { message, type, chat_id } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const result = await MiniAppService.sendNotification(message, type, chat_id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Notification sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
