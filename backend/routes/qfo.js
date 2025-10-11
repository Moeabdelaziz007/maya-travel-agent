const express = require('express');
const router = express.Router();
const qfoMasterController = require('../src/quantum/qfoMasterController');

// Main QFO process endpoint
router.post('/process', async (req, res) => {
  try {
    const request = {
      userId: req.body.userId,
      sessionId: req.body.sessionId,
      message: req.body.message,
      platform: req.body.platform || 'web',
      context: req.body.context || {},
      syncAcrossPlatforms: req.body.syncAcrossPlatforms !== false
    };

    const result = await qfoMasterController.processUserRequest(request);
    res.json(result);
  } catch (error) {
    console.error('QFO processing error:', error);
    res.status(500).json({
      success: false,
      error: 'QFO processing failed',
      message: error.message
    });
  }
});

// System status
router.get('/status', (req, res) => {
  try {
    const status = qfoMasterController.getSystemStatus();
    res.json({ success: true, qfo: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'QuantumFlow Orchestrator',
    version: qfoMasterController.version,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
