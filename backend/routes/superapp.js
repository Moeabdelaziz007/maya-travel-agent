const express = require('express');
const router = express.Router();
const superAppOrchestrator = require('../src/quantum/superAppOrchestrator');

// Sync state across platforms
router.post('/sync', async (req, res) => {
  try {
    const { userId, stateUpdate } = req.body;
    const result = await superAppOrchestrator.syncStateAcrossPlatforms(userId, stateUpdate);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Broadcast message
router.post('/broadcast', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const result = await superAppOrchestrator.broadcastMessage(userId, message);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
