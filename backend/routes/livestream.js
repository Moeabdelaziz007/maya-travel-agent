const express = require('express');
const router = express.Router();
const liveStreamCommerce = require('../src/quantum/liveStreamCommerce');

// Start live stream
router.post('/start', async (req, res) => {
  try {
    const stream = await liveStreamCommerce.startLiveStream(req.body);
    res.json({ success: true, stream });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create live deal
router.post('/:streamId/deal', async (req, res) => {
  try {
    const deal = await liveStreamCommerce.createLiveDeal(req.params.streamId, req.body);
    res.json({ success: true, deal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book from live stream
router.post('/deal/:dealId/book', async (req, res) => {
  try {
    const booking = await liveStreamCommerce.bookFromLiveStream(
      req.params.dealId,
      req.body.viewerId,
      req.body
    );
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active streams
router.get('/active', (req, res) => {
  try {
    const streams = liveStreamCommerce.getActiveStreams();
    res.json({ success: true, streams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
