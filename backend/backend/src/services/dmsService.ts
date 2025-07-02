import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { 
  DMSConfig, 
  DMSMessage, 
  TextMessage, 
  MenuMessage, 
  CarouselMessage, 
  UrlLinkMessage, 
  SessionInfo,
  ActivityLog 
} from '../types/dms.js';

// Note: This is a mock implementation since we don't have the actual dms-client-channel package
// In a real implementation, you would import and use the actual package
interface DMSClientChannel {
  connect(config: DMSConfig): Promise<void>;
  disconnect(): Promise<void>;
  sendTextMessage(customerId: string, message: string): Promise<void>;
  sendMessage(customerId: string, message: any): Promise<void>;
  onTextMessage(callback: (message: TextMessage) => void): void;
  onMenuMessage(callback: (message: MenuMessage) => void): void;
  onCarouselMessage(callback: (message: CarouselMessage) => void): void;
  onUrlLinkMessage(callback: (message: UrlLinkMessage) => void): void;
  onTypingIndicator(callback: (customerId: string) => void): void;
  onCsrEndSession(callback: (customerId: string) => void): void;
}

class DMSService extends EventEmitter {
  private client: DMSClientChannel | null = null;
  private isConnected = false;
  private currentConfig: DMSConfig | null = null;
  private sessions: Map<string, SessionInfo> = new Map();
  private activityLogs: ActivityLog[] = [];

  constructor() {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Handle process shutdown
    process.on('SIGINT', () => this.disconnect());
    process.on('SIGTERM', () => this.disconnect());
  }

  async connect(config: DMSConfig): Promise<void> {
    try {
      logger.info('Attempting to connect to DMS', { 
        channel_id: config.channel_id,
        api_url: config.api_url 
      });

      // In a real implementation, you would use the actual dms-client-channel package:
      // const { DMSClientChannel } = await import('dms-client-channel');
      // this.client = new DMSClientChannel();
      
      // For now, we'll simulate the connection
      this.client = await this.createMockClient();
      
      await this.client.connect(config);
      
      this.currentConfig = config;
      this.isConnected = true;
      
      this.setupDMSCallbacks();
      
      this.logActivity({
        type: 'system',
        message: 'Successfully connected to DMS',
        data: { channel_id: config.channel_id }
      });

      logger.info('Successfully connected to DMS');
      this.emit('connected', { config });
      
    } catch (error) {
      logger.error('Failed to connect to DMS', error);
      this.logActivity({
        type: 'error',
        message: 'Failed to connect to DMS',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.disconnect();
        logger.info('Disconnected from DMS');
        
        this.logActivity({
          type: 'system',
          message: 'Disconnected from DMS'
        });
        
      } catch (error) {
        logger.error('Error disconnecting from DMS', error);
      }
    }
    
    this.client = null;
    this.isConnected = false;
    this.currentConfig = null;
    this.sessions.clear();
    
    this.emit('disconnected');
  }

  private setupDMSCallbacks() {
    if (!this.client) return;

    // Set up all the callback handlers
    this.client.onTextMessage((message: TextMessage) => {
      logger.debug('Received text message', message);
      
      const dmsMessage: DMSMessage = {
        id: uuidv4(),
        customer_id: message.customer_id,
        message_type: 'text',
        content: message.message,
        timestamp: new Date(message.timestamp),
        metadata: message.metadata
      };
      
      this.logActivity({
        type: 'response',
        message: 'Received text message from DMS',
        data: dmsMessage
      });
      
      this.emit('message', dmsMessage);
    });

    this.client.onMenuMessage((message: MenuMessage) => {
      logger.debug('Received menu message', message);
      
      const dmsMessage: DMSMessage = {
        id: uuidv4(),
        customer_id: message.customer_id,
        message_type: 'menu',
        content: JSON.stringify({
          title: message.title,
          options: message.options
        }),
        timestamp: new Date(message.timestamp),
        metadata: message.metadata
      };
      
      this.logActivity({
        type: 'response',
        message: 'Received menu message from DMS',
        data: dmsMessage
      });
      
      this.emit('message', dmsMessage);
    });

    this.client.onCarouselMessage((message: CarouselMessage) => {
      logger.debug('Received carousel message', message);
      
      const dmsMessage: DMSMessage = {
        id: uuidv4(),
        customer_id: message.customer_id,
        message_type: 'carousel',
        content: JSON.stringify({ cards: message.cards }),
        timestamp: new Date(message.timestamp),
        metadata: message.metadata
      };
      
      this.logActivity({
        type: 'response',
        message: 'Received carousel message from DMS',
        data: dmsMessage
      });
      
      this.emit('message', dmsMessage);
    });

    this.client.onUrlLinkMessage((message: UrlLinkMessage) => {
      logger.debug('Received URL link message', message);
      
      const dmsMessage: DMSMessage = {
        id: uuidv4(),
        customer_id: message.customer_id,
        message_type: 'url_link',
        content: JSON.stringify({
          url: message.url,
          display_text: message.display_text
        }),
        timestamp: new Date(message.timestamp),
        metadata: message.metadata
      };
      
      this.logActivity({
        type: 'response',
        message: 'Received URL link message from DMS',
        data: dmsMessage
      });
      
      this.emit('message', dmsMessage);
    });

    this.client.onTypingIndicator((customer_id: string) => {
      logger.debug('Received typing indicator', { customer_id });
      
      this.logActivity({
        type: 'system',
        message: 'CSR is typing',
        data: { customer_id }
      });
      
      this.emit('typing', { customer_id });
    });

    this.client.onCsrEndSession((customer_id: string) => {
      logger.debug('CSR ended session', { customer_id });
      
      const session = this.sessions.get(customer_id);
      if (session) {
        session.status = 'ended';
        session.ended_at = new Date();
      }
      
      this.logActivity({
        type: 'system',
        message: 'CSR ended session',
        data: { customer_id }
      });
      
      this.emit('sessionEnded', { customer_id });
    });
  }

  async sendTextMessage(customerId: string, message: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Not connected to DMS');
    }

    const startTime = Date.now();
    
    try {
      logger.debug('Sending text message', { customer_id: customerId, message });
      
      await this.client.sendTextMessage(customerId, message);
      
      const duration = Date.now() - startTime;
      
      this.logActivity({
        type: 'request',
        method: 'sendTextMessage',
        message: 'Sent text message to DMS',
        data: { customer_id: customerId, message },
        duration_ms: duration
      });
      
      // Update or create session
      this.updateSession(customerId);
      
      logger.info('Successfully sent text message', { customer_id: customerId });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logActivity({
        type: 'error',
        method: 'sendTextMessage',
        message: 'Failed to send text message',
        data: { 
          customer_id: customerId, 
          message,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        duration_ms: duration
      });
      
      logger.error('Failed to send text message', error);
      throw error;
    }
  }

  async sendMessage(customerId: string, message: any): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Not connected to DMS');
    }

    const startTime = Date.now();
    
    try {
      logger.debug('Sending rich message', { customer_id: customerId, message });
      
      await this.client.sendMessage(customerId, message);
      
      const duration = Date.now() - startTime;
      
      this.logActivity({
        type: 'request',
        method: 'sendMessage',
        message: 'Sent rich message to DMS',
        data: { customer_id: customerId, message },
        duration_ms: duration
      });
      
      // Update or create session
      this.updateSession(customerId);
      
      logger.info('Successfully sent rich message', { customer_id: customerId });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logActivity({
        type: 'error',
        method: 'sendMessage',
        message: 'Failed to send rich message',
        data: { 
          customer_id: customerId, 
          message,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        duration_ms: duration
      });
      
      logger.error('Failed to send rich message', error);
      throw error;
    }
  }

  private updateSession(customerId: string) {
    if (!this.sessions.has(customerId)) {
      const session: SessionInfo = {
        customer_id: customerId,
        channel_id: this.currentConfig?.channel_id || '',
        session_id: uuidv4(),
        status: 'active',
        created_at: new Date()
      };
      this.sessions.set(customerId, session);
    }
  }

  private logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const log: ActivityLog = {
      id: uuidv4(),
      timestamp: new Date(),
      ...activity
    };
    
    this.activityLogs.push(log);
    
    // Keep only last 1000 logs
    if (this.activityLogs.length > 1000) {
      this.activityLogs = this.activityLogs.slice(-1000);
    }
    
    this.emit('activity', log);
  }

  // Getter methods
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      config: this.currentConfig,
      sessions: Array.from(this.sessions.values()),
      session_count: this.sessions.size
    };
  }

  getActivityLogs(limit = 100) {
    return this.activityLogs.slice(-limit).reverse();
  }

  getSessions() {
    return Array.from(this.sessions.values());
  }

  getSession(customerId: string) {
    return this.sessions.get(customerId);
  }

  // Mock client implementation for development/testing
  private async createMockClient(): Promise<DMSClientChannel> {
    return {
      async connect(config: DMSConfig) {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        logger.info('Mock DMS client connected');
      },
      
      async disconnect() {
        await new Promise(resolve => setTimeout(resolve, 500));
        logger.info('Mock DMS client disconnected');
      },
      
      async sendTextMessage(customerId: string, message: string) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Simulate receiving a response after sending
        setTimeout(() => {
          const mockResponse: TextMessage = {
            customer_id: customerId,
            message: `Mock CSR response to: "${message}"`,
            timestamp: new Date().toISOString(),
            metadata: { mock: true }
          };
          
          if ((this as any).mockCallbacks?.onTextMessage) {
            (this as any).mockCallbacks.onTextMessage(mockResponse);
          }
        }, 2000);
      },
      
      async sendMessage(customerId: string, message: any) {
        await new Promise(resolve => setTimeout(resolve, 200));
        logger.info('Mock rich message sent', { customerId, message });
      },
      
      onTextMessage: (callback) => {
        (this as any).mockCallbacks = (this as any).mockCallbacks || {};
        (this as any).mockCallbacks.onTextMessage = callback;
      },
      
      onMenuMessage: (callback) => {
        (this as any).mockCallbacks = (this as any).mockCallbacks || {};
        (this as any).mockCallbacks.onMenuMessage = callback;
      },
      
      onCarouselMessage: (callback) => {
        (this as any).mockCallbacks = (this as any).mockCallbacks || {};
        (this as any).mockCallbacks.onCarouselMessage = callback;
      },
      
      onUrlLinkMessage: (callback) => {
        (this as any).mockCallbacks = (this as any).mockCallbacks || {};
        (this as any).mockCallbacks.onUrlLinkMessage = callback;
      },
      
      onTypingIndicator: (callback) => {
        (this as any).mockCallbacks = (this as any).mockCallbacks || {};
        (this as any).mockCallbacks.onTypingIndicator = callback;
      },
      
      onCsrEndSession: (callback) => {
        (this as any).mockCallbacks = (this as any).mockCallbacks || {};
        (this as any).mockCallbacks.onCsrEndSession = callback;
      }
    };
  }

}

export const dmsService = new DMSService();
export default dmsService;