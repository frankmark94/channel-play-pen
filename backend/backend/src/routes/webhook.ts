import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ApiResponse } from '../types/dms.js';
import logger from '../utils/logger.js';
import dmsService from '../services/dmsService.js';

const router = Router();

// POST /dms - Webhook endpoint for receiving DMS messages
// This is called by Pega DMS when CSR sends messages or events
router.post('/dms', asyncHandler(async (req: Request, res: Response) => {
  logger.info('🔔 Received DMS webhook request', {
    headers: req.headers,
    body: req.body,
    url: req.url,
    method: req.method
  });

  // Get the DMS client instance
  const client = dmsService.getClient();

  if (!client) {
    logger.error('❌ DMS client not initialized - cannot process webhook');

    const response: ApiResponse = {
      success: false,
      error: 'DMS client not initialized',
      timestamp: new Date()
    };

    return res.status(503).json(response);
  }

  try {
    // Use the real DMS client's onRequest method to handle the webhook
    // This will trigger the appropriate callbacks (onTextMessage, onMenuMessage, etc.)
    client.onRequest(req, (status: number, message: string) => {
      logger.info('✅ DMS webhook processed', {
        status,
        message,
        timestamp: new Date()
      });

      // Send the response back to Pega DMS
      res.status(status).send(message);
    });

  } catch (error) {
    logger.error('❌ Error processing DMS webhook', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Still acknowledge to prevent retries
    const response: ApiResponse = {
      success: false,
      error: 'Error processing webhook',
      timestamp: new Date()
    };

    res.status(500).json(response);
  }
}));

// GET /dms - Health check for webhook endpoint
router.get('/dms', (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      message: 'DMS webhook endpoint is active',
      timestamp: new Date()
    },
    timestamp: new Date()
  };

  res.json(response);
});

export default router;