const express = require('express');
const router = express.Router();
const gamificationEngine = require('../src/quantum/gamificationEngine');

// Get user profile
router.get('/profile/:userId', (req, res) => {
  try {
    const profile = gamificationEngine.getUserProfile(req.params.userId);
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit feedback
router.post('/feedback', async (req, res) => {
  try {
    const { userId, workflowId, rating, comments } = req.body;
    const result = await gamificationEngine.recordFeedback(userId, workflowId, {
      rating,
      comments
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
