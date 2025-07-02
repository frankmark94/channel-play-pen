import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ApiResponse } from '../types/dms.js';
import logger from '../utils/logger.js';

const router = Router();

// POST /dms - Webhook endpoint for receiving DMS messages
router.post('/dms', asyncHandler(async (req: Request, res: Response) => {
  const webhookData = req.body;
  
  logger.info('Received DMS webhook', {
    headers: req.headers,
    body: webhookData
  });

  try {
    // Process the webhook data
    // The actual webhook payload structure depends on Pega DMS documentation
    
    // Example webhook processing:
    if (webhookData.type === 'message') {
      logger.info('Processing message webhook', {
        customer_id: webhookData.customer_id,
        message_type: webhookData.message_type
      });
      
      // The DMS service callbacks should handle this automatically
      // This webhook is mainly for logging and monitoring
    }
    
    if (webhookData.type === 'session_event') {
      logger.info('Processing session event webhook', {
        customer_id: webhookData.customer_id,
        event: webhookData.event
      });
    }

    // Acknowledge the webhook
    const response: ApiResponse = {
      success: true,
      data: {
        received: true,
        processed: true,
        timestamp: new Date()
      },
      timestamp: new Date()
    };

    res.status(200).json(response);
    
  } catch (error) {
    logger.error('Error processing DMS webhook', error);
    
    // Still acknowledge to prevent retries
    const response: ApiResponse = {
      success: false,
      error: 'Error processing webhook',
      timestamp: new Date()
    };

    res.status(200).json(response);
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