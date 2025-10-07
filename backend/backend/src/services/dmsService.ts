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

// Import the actual dms-client-channel package
// @ts-ignore - CommonJS module
import createDMSInstance from 'dms-client-channel';

interface DMSClientChannel {
  logRequests(enabled: boolean): void;
  onRequest(req: any, callback: (status: number, message: string) => void): void;
  sendTextMessage(customerId: string, messageId: string, text: string, customerName: string, callback?: (response: any) => void): void;
  sendMessage(message: any, callback?: (response: any) => void): void;
  sendTypingIndicator(customerId: string, callback?: (response: any) => void): void;
  onTextMessage: (message: any) => void;
  onMenuMessage: (message: any) => void;
  onCarouselMessage: (message: any) => void;
  onUrlLinkMessage: (message: any) => void;
  onTypingIndicator: (customerId: string) => void;
  onCsrEndSession: (customerId: string) => void;
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
        api_url: config.api_url,
        webhook_url: config.webhook_url
      });

      // Create instance of dms-client-channel with config
      this.client = createDMSInstance({
        JWT_SECRET: config.jwt_secret,
        CHANNEL_ID: config.channel_id,
        API_URL: config.api_url
      }) as DMSClientChannel;

      // Enable request logging for debugging
      this.client.logRequests(true);

      this.currentConfig = config;
      this.isConnected = true;

      // Setup callbacks to handle messages from DMS
      this.setupDMSCallbacks();

      this.logActivity({
        type: 'system',
        message: 'Successfully connected to DMS (real client)',
        data: {
          channel_id: config.channel_id,
          api_url: config.api_url,
          webhook_url: config.webhook_url
        }
      });

      logger.info('✅ Successfully connected to DMS with real client', {
        channel_id: config.channel_id,
        package: 'dms-client-channel@1.2.1'
      });

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
        // Note: dms-client-channel doesn't have a disconnect method
        // Just clear the reference and update status
        logger.info('Disconnecting from DMS');

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

    // Set up all the callback handlers for messages received FROM DMS
    this.client.onTextMessage = (message: any) => {
      logger.info('📨 Received text message from DMS', {
        customer_id: message.customer_id,
        message_id: message.message_id,
        text: message.text,
        csr_name: message.csr_name
      });

      const dmsMessage: DMSMessage = {
        id: message.message_id || uuidv4(),
        customer_id: message.customer_id,
        message_type: 'text',
        content: Array.isArray(message.text) ? message.text.join(' ') : message.text,
        timestamp: new Date(),
        metadata: {
          csr_name: message.csr_name,
          attachments: message.attachments
        }
      };

      this.logActivity({
        type: 'response',
        message: 'Received text message from DMS',
        data: dmsMessage
      });

      this.emit('message', dmsMessage);
    };

    this.client.onMenuMessage = (message: any) => {
      logger.info('📋 Received menu message from DMS', message);

      const dmsMessage: DMSMessage = {
        id: message.message_id || uuidv4(),
        customer_id: message.customer_id,
        message_type: 'menu',
        content: JSON.stringify({
          title: message.title,
          items: message.items
        }),
        timestamp: new Date(),
        metadata: { csr_name: message.csr_name }
      };

      this.logActivity({
        type: 'response',
        message: 'Received menu message from DMS',
        data: dmsMessage
      });

      this.emit('message', dmsMessage);
    };

    this.client.onCarouselMessage = (message: any) => {
      logger.info('🎠 Received carousel message from DMS', message);

      const dmsMessage: DMSMessage = {
        id: message.message_id || uuidv4(),
        customer_id: message.customer_id,
        message_type: 'carousel',
        content: JSON.stringify({ items: message.items }),
        timestamp: new Date(),
        metadata: { csr_name: message.csr_name }
      };

      this.logActivity({
        type: 'response',
        message: 'Received carousel message from DMS',
        data: dmsMessage
      });

      this.emit('message', dmsMessage);
    };

    this.client.onUrlLinkMessage = (message: any) => {
      logger.info('🔗 Received URL link message from DMS', message);

      const dmsMessage: DMSMessage = {
        id: message.message_id || uuidv4(),
        customer_id: message.customer_id,
        message_type: 'url_link',
        content: JSON.stringify({
          title: message.title,
          label: message.label,
          url: message.url
        }),
        timestamp: new Date(),
        metadata: { csr_name: message.csr_name }
      };

      this.logActivity({
        type: 'response',
        message: 'Received URL link message from DMS',
        data: dmsMessage
      });

      this.emit('message', dmsMessage);
    };

    this.client.onTypingIndicator = (customer_id: string) => {
      logger.info('⌨️  CSR is typing', { customer_id });

      this.logActivity({
        type: 'system',
        message: 'CSR is typing',
        data: { customer_id }
      });

      this.emit('typing', { customer_id });
    };

    this.client.onCsrEndSession = (customer_id: string) => {
      logger.info('🛑 CSR ended session', { customer_id });

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
    };
  }

  async sendTextMessage(customerId: string, message: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Not connected to DMS');
    }

    const startTime = Date.now();
    const messageId = uuidv4();

    try {
      logger.info('📤 Sending text message to DMS', {
        customer_id: customerId,
        message_id: messageId,
        message_preview: message.substring(0, 100),
        api_url: this.currentConfig?.api_url,
        channel_id: this.currentConfig?.channel_id
      });

      // Use the real DMS client send method
      // Signature: sendTextMessage(customerId, messageId, text, customerName, callback)
      await new Promise<void>((resolve, reject) => {
        this.client!.sendTextMessage(
          customerId,
          messageId,
          message,
          'Customer', // customer_name
          (response) => {
            const duration = Date.now() - startTime;

            logger.info('✅ DMS API Response', {
              status: response.status,
              statusText: response.statusText,
              duration_ms: duration
            });

            if (response.status >= 200 && response.status < 300) {
              this.logActivity({
                type: 'request',
                method: 'sendTextMessage',
                message: `Sent text message to DMS - ${response.statusText}`,
                data: {
                  customer_id: customerId,
                  message_id: messageId,
                  message,
                  status: response.status
                },
                duration_ms: duration,
                status_code: response.status
              });

              resolve();
            } else {
              const error = new Error(`DMS API error: ${response.status} - ${response.statusText}`);

              this.logActivity({
                type: 'error',
                method: 'sendTextMessage',
                message: 'DMS API returned error status',
                data: {
                  customer_id: customerId,
                  message,
                  status: response.status,
                  statusText: response.statusText
                },
                duration_ms: duration,
                status_code: response.status
              });

              reject(error);
            }
          }
        );
      });

      // Update or create session
      this.updateSession(customerId);

      logger.info('✅ Successfully sent text message to DMS', {
        customer_id: customerId,
        message_id: messageId
      });

    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('❌ Failed to send text message to DMS', {
        error: error instanceof Error ? error.message : 'Unknown error',
        customer_id: customerId,
        duration_ms: duration
      });

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

  // Get the DMS client instance (used by webhook route)
  getClient() {
    return this.client;
  }
}

export const dmsService = new DMSService();
export default dmsService;