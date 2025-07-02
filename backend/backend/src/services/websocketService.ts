import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { WebSocketMessage } from '../types/api.js';
import dmsService from './dmsService.js';

interface WebSocketClient {
  id: string;
  ws: WebSocket;
  isAlive: boolean;
  connectedAt: Date;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws) => {
      const clientId = uuidv4();
      const client: WebSocketClient = {
        id: clientId,
        ws,
        isAlive: true,
        connectedAt: new Date()
      };
      
      this.clients.set(clientId, client);
      
      logger.info(`WebSocket client connected: ${clientId}`);
      
      // Send connection confirmation
      this.sendToClient(clientId, {
        type: 'status',
        data: { 
          connected: true, 
          clientId,
          dmsStatus: dmsService.getConnectionStatus()
        },
        timestamp: new Date()
      });

      // Set up message handling
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(clientId, message);
        } catch (error) {
          logger.error('Invalid WebSocket message received', { clientId, error });
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.info(`WebSocket client disconnected: ${clientId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      // Pong handler for heartbeat
      ws.on('pong', () => {
        client.isAlive = true;
      });
    });

    // Start heartbeat to detect dead connections
    this.startHeartbeat();
    
    // Set up DMS service event listeners
    this.setupDMSEventListeners();
    
    logger.info('WebSocket service initialized');
  }

  private handleClientMessage(clientId: string, message: any) {
    logger.debug(`Received message from client ${clientId}:`, message);
    
    switch (message.type) {
      case 'ping':
        this.sendToClient(clientId, {
          type: 'pong',
          data: { timestamp: new Date() },
          timestamp: new Date()
        });
        break;
        
      case 'subscribe':
        // Handle subscription to specific events
        this.sendToClient(clientId, {
          type: 'subscribed',
          data: { events: message.data?.events || [] },
          timestamp: new Date()
        });
        break;
        
      default:
        logger.warn(`Unknown message type from client ${clientId}:`, message.type);
    }
  }

  private setupDMSEventListeners() {
    // Listen for DMS messages
    dmsService.on('message', (message) => {
      this.broadcast({
        type: 'message',
        data: message,
        timestamp: new Date()
      });
    });

    // Listen for DMS activity logs
    dmsService.on('activity', (activity) => {
      this.broadcast({
        type: 'activity',
        data: activity,
        timestamp: new Date()
      });
    });

    // Listen for connection status changes
    dmsService.on('connected', (data) => {
      this.broadcast({
        type: 'status',
        data: { connected: true, ...data },
        timestamp: new Date()
      });
    });

    dmsService.on('disconnected', () => {
      this.broadcast({
        type: 'status',
        data: { connected: false },
        timestamp: new Date()
      });
    });

    // Listen for typing indicators
    dmsService.on('typing', (data) => {
      this.broadcast({
        type: 'message',
        data: {
          id: uuidv4(),
          customer_id: data.customer_id,
          message_type: 'typing',
          content: 'CSR is typing...',
          timestamp: new Date()
        },
        timestamp: new Date()
      });
    });

    // Listen for session ended events
    dmsService.on('sessionEnded', (data) => {
      this.broadcast({
        type: 'message',
        data: {
          id: uuidv4(),
          customer_id: data.customer_id,
          message_type: 'system',
          content: 'Session ended by CSR',
          timestamp: new Date()
        },
        timestamp: new Date()
      });
    });
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      for (const [clientId, client] of this.clients) {
        if (!client.isAlive) {
          logger.info(`Terminating dead WebSocket connection: ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
          continue;
        }
        
        client.isAlive = false;
        client.ws.ping();
      }
    }, 30000); // 30 seconds
  }

  sendToClient(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) {
      logger.warn(`Attempted to send message to non-existent client: ${clientId}`);
      return;
    }

    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        logger.error(`Failed to send message to client ${clientId}:`, error);
        this.clients.delete(clientId);
      }
    }
  }

  broadcast(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    
    for (const [clientId, client] of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(messageStr);
        } catch (error) {
          logger.error(`Failed to broadcast to client ${clientId}:`, error);
          this.clients.delete(clientId);
        }
      }
    }
    
    logger.debug(`Broadcasted message to ${this.clients.size} clients`);
  }

  getConnectedClients() {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      connectedAt: client.connectedAt,
      isAlive: client.isAlive
    }));
  }

  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Close all client connections
    for (const client of this.clients.values()) {
      client.ws.close();
    }
    
    this.clients.clear();
    
    if (this.wss) {
      this.wss.close();
    }
    
    logger.info('WebSocket service shutdown');
  }
}

export const websocketService = new WebSocketService();
export default websocketService;