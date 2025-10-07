const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Webhook endpoint must receive raw body (configured in server.js)
router.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await supabase
        .from('payments')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('stripe_session_id', session.id);
    }

    if (event.type === 'checkout.session.async_payment_failed' || event.type === 'payment_intent.payment_failed') {
      const session = event.data.object;
      await supabase
        .from('payments')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('stripe_session_id', session.id || session?.metadata?.stripe_session_id || null);
    }

    return res.json({ received: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to handle webhook', message: e.message });
  }
});

module.exports = router;

