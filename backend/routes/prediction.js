const express = require('express');
const router = express.Router();
const proactiveAIPrediction = require('../src/quantum/proactiveAIPrediction');

// Predict user needs
router.post('/user-needs', async (req, res) => {
  try {
    const { userId, context } = req.body;
    const result = await proactiveAIPrediction.predictUserNeeds(userId, context);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predict price trends
router.post('/price-trends', async (req, res) => {
  try {
    const { destination, dateRange } = req.body;
    const result = await proactiveAIPrediction.predictPriceTrends(destination, dateRange);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate prediction
router.post('/validate', (req, res) => {
  try {
    const { predictionId, actualOutcome } = req.body;
    const result = proactiveAIPrediction.validatePrediction(predictionId, actualOutcome);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get accuracy metrics
router.get('/accuracy', (req, res) => {
  try {
    const metrics = proactiveAIPrediction.getAccuracyMetrics();
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
