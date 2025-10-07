import { Router, Request, Response } from 'express';
import {
  connectSchema,
  sendMessageSchema,
  endSessionSchema,
  validateRequest
} from '../utils/validation.js';
import {
  ConnectRequest,
  SendMessageRequest,
  EndSessionRequest
} from '../types/api.js';
import { ApiResponse } from '../types/dms.js';
import { asyncHandler, CustomError } from '../middleware/errorHandler.js';
import dmsService from '../services/dmsService.js';
import credentialManager, { CredentialManager } from '../services/credentialManager.js';
import logger from '../utils/logger.js';

const router = Router();

// POST /api/connect - Test DMS connection with user credentials
router.post('/connect', asyncHandler(async (req: Request, res: Response) => {
  logger.info('🔌 Connect request received', {
    body_keys: Object.keys(req.body),
    customer_id: req.body.customer_id,
    channel_id: req.body.channel_id,
    api_url: req.body.api_url
  });

  const validation = validateRequest<ConnectRequest>(connectSchema, req.body);

  if (!validation.isValid) {
    logger.warn('❌ Connect validation failed', { errors: validation.errors });
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      data: { errors: validation.errors },
      timestamp: new Date()
    };
    return res.status(400).json(response);
  }

  const { customer_id, jwt_secret, channel_id, api_url } = validation.data!;

  // Validate credentials format
  const credValidation = CredentialManager.validateCredentials({
    jwt_secret,
    channel_id,
    api_url
  });

  if (!credValidation.isValid) {
    logger.warn('❌ Credential validation failed', { errors: credValidation.errors });
    const response: ApiResponse = {
      success: false,
      error: 'Invalid credentials',
      data: { errors: credValidation.errors },
      timestamp: new Date()
    };
    return res.status(400).json(response);
  }

  try {
    // Store credentials and get session ID
    const sessionId = credentialManager.storeCredentials({
      jwt_secret,
      channel_id,
      api_url,
      webhook_url: process.env.WEBHOOK_BASE_URL ?
        `${process.env.WEBHOOK_BASE_URL}/dms` : undefined
    });

    logger.debug('📝 Credentials stored', { session_id: sessionId });

    // Disconnect existing connection if any
    await dmsService.disconnect();

    // Connect with new configuration
    await dmsService.connect({
      jwt_secret,
      channel_id,
      api_url,
      webhook_url: process.env.WEBHOOK_BASE_URL ?
        `${process.env.WEBHOOK_BASE_URL}/dms` : undefined
    });

    const status = dmsService.getConnectionStatus();

    const response: ApiResponse = {
      success: true,
      data: {
        connected: true,
        customer_id,
        channel_id,
        session_id: sessionId,
        status,
        message: 'Connected successfully with your credentials'
      },
      timestamp: new Date()
    };

    logger.info('✅ DMS connection established', { customer_id, channel_id, session_id: sessionId });
    res.json(response);

  } catch (error) {
    logger.error('❌ Failed to connect to DMS', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      customer_id,
      channel_id
    });
    throw new CustomError(
      error instanceof Error ? error.message : 'Failed to connect to DMS',
      500
    );
  }
}));

// POST /api/send-message - Send messages to DMS
router.post('/send-message', asyncHandler(async (req: Request, res: Response) => {
  logger.info('💬 Send message request received', {
    customer_id: req.body.customer_id,
    message_type: req.body.message_type,
    message_preview: req.body.message?.substring(0, 50)
  });

  const validation = validateRequest<SendMessageRequest>(sendMessageSchema, req.body);

  if (!validation.isValid) {
    logger.warn('❌ Send message validation failed', { errors: validation.errors });
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      data: { errors: validation.errors },
      timestamp: new Date()
    };
    return res.status(400).json(response);
  }

  const { customer_id, message, message_type, metadata } = validation.data!;

  try {
    const startTime = Date.now();

    if (message_type === 'rich_content') {
      logger.debug('📦 Sending rich content message', { customer_id, metadata });
      // Send rich content message
      await dmsService.sendMessage(customer_id, {
        message,
        metadata
      });
    } else {
      logger.debug('📝 Sending text message', { customer_id, message_length: message.length });
      // Send simple text message
      await dmsService.sendTextMessage(customer_id, message);
    }

    const duration = Date.now() - startTime;

    const response: ApiResponse = {
      success: true,
      data: {
        message_sent: true,
        customer_id,
        message_type,
        timestamp: new Date()
      },
      timestamp: new Date()
    };

    logger.info('✅ Message sent to DMS', { customer_id, message_type, duration_ms: duration });
    res.json(response);

  } catch (error) {
    logger.error('❌ Failed to send message', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      customer_id,
      message_type
    });
    throw new CustomError(
      error instanceof Error ? error.message : 'Failed to send message',
      500
    );
  }
}));

// POST /api/end-session - End chat sessions
router.post('/end-session', asyncHandler(async (req: Request, res: Response) => {
  const validation = validateRequest<EndSessionRequest>(endSessionSchema, req.body);
  
  if (!validation.isValid) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      data: { errors: validation.errors },
      timestamp: new Date()
    };
    return res.status(400).json(response);
  }

  const { customer_id, reason } = validation.data!;

  try {
    // Note: The actual DMS client might have an endSession method
    // For now, we'll just log it and mark the session as ended
    const session = dmsService.getSession(customer_id);
    
    if (!session) {
      throw new CustomError(`Session not found for customer: ${customer_id}`, 404);
    }

    // In a real implementation, you might call:
    // await dmsService.endSession(customer_id, reason);
    
    const response: ApiResponse = {
      success: true,
      data: {
        session_ended: true,
        customer_id,
        reason,
        timestamp: new Date()
      },
      timestamp: new Date()
    };

    logger.info('Session ended', { customer_id, reason });
    res.json(response);
    
  } catch (error) {
    logger.error('Failed to end session', error);
    throw new CustomError(
      error instanceof Error ? error.message : 'Failed to end session',
      500
    );
  }
}));

// GET /api/status - Get connection status
router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  const status = dmsService.getConnectionStatus();
  const sessions = dmsService.getSessions();
  const activityLogs = dmsService.getActivityLogs(50);

  const response: ApiResponse = {
    success: true,
    data: {
      connection: status,
      sessions,
      recent_activity: activityLogs,
      timestamp: new Date()
    },
    timestamp: new Date()
  };

  res.json(response);
}));

// GET /api/activity - Get activity logs
router.get('/activity', asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const activityLogs = dmsService.getActivityLogs(limit);

  const response: ApiResponse = {
    success: true,
    data: {
      logs: activityLogs,
      count: activityLogs.length
    },
    timestamp: new Date()
  };

  res.json(response);
}));

// GET /api/sessions - Get active sessions
router.get('/sessions', asyncHandler(async (req: Request, res: Response) => {
  const sessions = dmsService.getSessions();

  const response: ApiResponse = {
    success: true,
    data: {
      sessions,
      count: sessions.length
    },
    timestamp: new Date()
  };

  res.json(response);
}));

// GET /api/health - Health check endpoint
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const status = dmsService.getConnectionStatus();
  
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'healthy',
      dms_connected: status.connected,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    },
    timestamp: new Date()
  };

  res.json(response);
}));

export default router;