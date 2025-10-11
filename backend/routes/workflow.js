const express = require('express');
const router = express.Router();
const workflowEngine = require('../src/workflows/workflowEngine');

// Process a workflow message
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await workflowEngine.processMessage(
      sessionId || `session_${Date.now()}`,
      message,
      context || {}
    );

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Workflow message error:', error);
    res.status(500).json({ error: 'Failed to process message', message: error.message });
  }
});

module.exports = router;
