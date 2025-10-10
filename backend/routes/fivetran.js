const express = require('express');
const router = express.Router();
const FivetranService = require('../src/services/fivetran-service');
const logger = require('../src/utils/logger');

// Initialize Fivetran service
let fivetranService;
try {
  fivetranService = new FivetranService();
} catch (error) {
  logger.error('Failed to initialize Fivetran service:', error.message);
}

/**
 * @route POST /api/fivetran/connectors/telegram
 * @desc Create Telegram connector
 * @access Private
 */
router.post('/connectors/telegram', async (req, res) => {
  try {
    const { botToken, destinationId, syncFrequency = 1 } = req.body;

    if (!botToken || !destinationId) {
      return res.status(400).json({
        success: false,
        error: 'botToken and destinationId are required'
      });
    }

    const result = await fivetranService.createTelegramConnector({
      botToken,
      destinationId,
      syncFrequency
    });

    logger.info('Telegram connector created:', result);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error creating Telegram connector:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/fivetran/connectors/stripe
 * @desc Create Stripe connector
 * @access Private
 */
router.post('/connectors/stripe', async (req, res) => {
  try {
    const { apiKey, destinationId, syncFrequency = 1 } = req.body;

    if (!apiKey || !destinationId) {
      return res.status(400).json({
        success: false,
        error: 'apiKey and destinationId are required'
      });
    }

    const result = await fivetranService.createStripeConnector({
      apiKey,
      destinationId,
      syncFrequency
    });

    logger.info('Stripe connector created:', result);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error creating Stripe connector:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/fivetran/destinations/supabase
 * @desc Create Supabase destination
 * @access Private
 */
router.post('/destinations/supabase', async (req, res) => {
  try {
    const { host, database, user, password, schema = 'public', port = 5432 } = req.body;

    if (!host || !database || !user || !password) {
      return res.status(400).json({
        success: false,
        error: 'host, database, user, and password are required'
      });
    }

    const result = await fivetranService.createSupabaseDestination({
      host,
      port,
      database,
      user,
      password,
      schema
    });

    logger.info('Supabase destination created:', result);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error creating Supabase destination:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/fivetran/connectors/:connectorId/status
 * @desc Get connector status
 * @access Private
 */
router.get('/connectors/:connectorId/status', async (req, res) => {
  try {
    const { connectorId } = req.params;
    const status = await fivetranService.getConnectorStatus(connectorId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error getting connector status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/fivetran/connectors/:connectorId/sync
 * @desc Trigger manual sync
 * @access Private
 */
router.post('/connectors/:connectorId/sync', async (req, res) => {
  try {
    const { connectorId } = req.params;
    const result = await fivetranService.syncConnector(connectorId);

    logger.info('Manual sync triggered for connector:', connectorId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error triggering sync:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/fivetran/connectors/:connectorId/logs
 * @desc Get sync logs
 * @access Private
 */
router.get('/connectors/:connectorId/logs', async (req, res) => {
  try {
    const { connectorId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const logs = await fivetranService.getSyncLogs(connectorId, limit);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error('Error getting sync logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route PATCH /api/fivetran/connectors/:connectorId/pause
 * @desc Pause or resume connector
 * @access Private
 */
router.patch('/connectors/:connectorId/pause', async (req, res) => {
  try {
    const { connectorId } = req.params;
    const { paused } = req.body;

    if (typeof paused !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'paused must be a boolean'
      });
    }

    const result = await fivetranService.setConnectorPaused(connectorId, paused);

    logger.info(`Connector ${connectorId} ${paused ? 'paused' : 'resumed'}`);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error updating connector pause state:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/fivetran/connectors
 * @desc List all connectors
 * @access Private
 */
router.get('/connectors', async (req, res) => {
  try {
    const connectors = await fivetranService.listConnectors();

    res.json({
      success: true,
      data: connectors
    });
  } catch (error) {
    logger.error('Error listing connectors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/fivetran/transform/telegram
 * @desc Transform Telegram data
 * @access Private
 */
router.post('/transform/telegram', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'data is required'
      });
    }

    const transformed = fivetranService.transformTelegramData(data);
    fivetranService.validateData(transformed, 'telegram');

    res.json({
      success: true,
      data: transformed
    });
  } catch (error) {
    logger.error('Error transforming Telegram data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/fivetran/transform/stripe
 * @desc Transform Stripe data
 * @access Private
 */
router.post('/transform/stripe', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'data is required'
      });
    }

    const transformed = fivetranService.transformStripeData(data);
    fivetranService.validateData(transformed, 'stripe');

    res.json({
      success: true,
      data: transformed
    });
  } catch (error) {
    logger.error('Error transforming Stripe data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/fivetran/connectors/:connectorId
 * @desc Delete connector
 * @access Private
 */
router.delete('/connectors/:connectorId', async (req, res) => {
  try {
    const { connectorId } = req.params;
    const result = await fivetranService.deleteConnector(connectorId);

    logger.info('Connector deleted:', connectorId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error deleting connector:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;