const express = require('express');
const router = express.Router();

// Payment service integration
class PaymentService {
  // Stripe integration with payment links
  static async createStripePayment(amount, currency = 'USD', description = 'Amrikyy Trips Payment') {
    try {
      // Create Stripe payment link using MCP tool
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      // Create a price for the payment
      const price = await stripe.prices.create({
        unit_amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        product_data: {
          name: description,
          description: `Amrikyy Trips - ${description}`
        }
      });

      // Create payment link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1
          }
        ],
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`
          }
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        payment_method_types: ['card']
      });

      return { 
        success: true, 
        data: {
          id: paymentLink.id,
          url: paymentLink.url,
          amount: amount,
          currency: currency,
          description: description,
          status: 'created'
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // PayPal integration
  static async createPayPalPayment(amount, currency = 'USD', description = 'Amrikyy Trips Payment') {
    try {
      // This would integrate with PayPal API
      const payment = {
        id: `PAY-${Date.now()}`,
        amount: {
          total: amount.toString(),
          currency
        },
        description,
        state: 'created',
        create_time: new Date().toISOString()
      };
      
      return { success: true, data: payment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Telegram Bot payment integration
  static async createTelegramPayment(amount, currency = 'USD', description = 'Amrikyy Trips Payment', chatId) {
    try {
      // This would integrate with Telegram Bot API for payments
      const payment = {
        id: `tg_${Date.now()}`,
        amount,
        currency,
        description,
        chat_id: chatId,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      return { success: true, data: payment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create Stripe payment link
router.post('/create-payment-link', async (req, res) => {
  try {
    const { amount, currency, description, customerEmail } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required and must be greater than 0'
      });
    }

    const paymentResult = await PaymentService.createStripePayment(amount, currency, description);
    
    if (paymentResult.success) {
      res.json({
        success: true,
        paymentLink: paymentResult.data,
        message: 'Payment link created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: paymentResult.error
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

// Create payment intent
router.post('/create-payment', async (req, res) => {
  try {
    const { amount, currency, paymentMethod, description, chatId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required and must be greater than 0'
      });
    }

    let paymentResult;
    
    switch (paymentMethod) {
    case 'stripe':
      paymentResult = await PaymentService.createStripePayment(amount, currency, description);
      break;
    case 'paypal':
      paymentResult = await PaymentService.createPayPalPayment(amount, currency, description);
      break;
    case 'telegram':
      paymentResult = await PaymentService.createTelegramPayment(amount, currency, description, chatId);
      break;
    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method. Supported: stripe, paypal, telegram'
      });
    }

    if (paymentResult.success) {
      res.json({
        success: true,
        payment: paymentResult.data,
        message: 'Payment created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: paymentResult.error
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

// Confirm payment
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentId, paymentMethod } = req.body;
    
    if (!paymentId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID and method are required'
      });
    }

    // Simulate payment confirmation
    const confirmation = {
      id: paymentId,
      status: 'succeeded',
      confirmed_at: new Date().toISOString(),
      method: paymentMethod
    };

    res.json({
      success: true,
      confirmation,
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get payment status
router.get('/payment-status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Simulate payment status check
    const status = {
      id: paymentId,
      status: 'succeeded',
      amount: 100.00,
      currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      payment: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Telegram Bot webhook for payments
router.post('/telegram-webhook', async (req, res) => {
  try {
    const { update } = req.body;
    
    if (update.pre_checkout_query) {
      // Handle pre-checkout query
      const { id, from, currency, total_amount } = update.pre_checkout_query;
      
      // Validate payment
      const isValid = total_amount > 0 && currency === 'USD';
      
      if (isValid) {
        // Approve payment
        res.json({
          success: true,
          message: 'Payment approved',
          pre_checkout_query_id: id
        });
      } else {
        // Reject payment
        res.status(400).json({
          success: false,
          error: 'Invalid payment amount or currency'
        });
      }
    } else if (update.message && update.message.successful_payment) {
      // Handle successful payment
      const { successful_payment } = update.message;
      
      res.json({
        success: true,
        message: 'Payment processed successfully',
        payment: successful_payment
      });
    } else {
      res.json({
        success: true,
        message: 'Webhook received'
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
