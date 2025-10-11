const express = require('express');
const router = express.Router();
const blockchainTrustLayer = require('../src/quantum/blockchainTrustLayer');

// Create transaction
router.post('/transaction', async (req, res) => {
  try {
    const transaction = await blockchainTrustLayer.createTransaction(req.body);
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mine pending transactions
router.post('/mine', async (req, res) => {
  try {
    const block = await blockchainTrustLayer.minePendingTransactions(req.body.validator);
    res.json({ success: true, block });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get blockchain info
router.get('/info', (req, res) => {
  try {
    const info = blockchainTrustLayer.getBlockchainInfo();
    res.json({ success: true, ...info });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify transaction
router.get('/verify/:txId', (req, res) => {
  try {
    const result = blockchainTrustLayer.verifyTransaction(req.params.txId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user transaction history
router.get('/user/:userId/history', (req, res) => {
  try {
    const transactions = blockchainTrustLayer.getUserTransactionHistory(req.params.userId);
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record trip booking
router.post('/record/booking', async (req, res) => {
  try {
    const transaction = await blockchainTrustLayer.recordTripBooking(req.body);
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record payment
router.post('/record/payment', async (req, res) => {
  try {
    const transaction = await blockchainTrustLayer.recordPayment(req.body);
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
