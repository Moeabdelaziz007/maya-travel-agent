/**
 * API Routes for Streaming
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');
const { authenticate, rateLimiter } = require('../middleware/auth');

/**
 * @route GET /api/stream/stats/:agent?
 * @description Get streaming statistics.
 * @access Private
 *
 * NOTE: This route must be registered BEFORE `/:agent` so the literal
 * `/stats` segment is matched before the `:agent` wildcard.
 */
router.get(
    '/stats/:agent?',
    authenticate, // Secure the endpoint
    streamController.getStreamingStats
);

/**
 * @route GET /api/stream/:agent
 * @description Stream responses from a specified agent.
 * @access Private
 */
router.get(
    '/:agent',
    authenticate, // Secure the endpoint
    rateLimiter,    // Prevent abuse
    streamController.streamAgentResponse
);

module.exports = router;
