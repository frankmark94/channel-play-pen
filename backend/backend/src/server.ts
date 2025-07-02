import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import websocketService from './services/websocketService.js';
import dmsService from './services/dmsService.js';

// Import routes
import apiRoutes from './routes/api.js';
import webhookRoutes from './routes/webhook.js';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configure CORS for production and development
const corsOrigins: string[] = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL || 'https://dms-channel-frontend.onrender.com',
      'https://dms-channel-frontend.onrender.com'
    ].filter((url): url is string => Boolean(url))
  : ['http://localhost:8080', 'http://localhost:5173'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));
app.use(requestLogger);

// Routes
app.use('/api', apiRoutes);
app.use('/', webhookRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'DMS Client Channel Backend API',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date()
    },
    timestamp: new Date()
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize WebSocket service
websocketService.initialize(server);

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Starting graceful shutdown...');
  
  try {
    // Close WebSocket connections
    websocketService.shutdown();
    
    // Disconnect from DMS
    await dmsService.disconnect();
    
    // Close HTTP server
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forcing server shutdown');
      process.exit(1);
    }, 10000);
    
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// Start server
server.listen(port, () => {
  logger.info(`🚀 DMS Client Channel Backend running on port ${port}`);
  logger.info(`📡 WebSocket server initialized`);
  logger.info(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
  logger.info(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;