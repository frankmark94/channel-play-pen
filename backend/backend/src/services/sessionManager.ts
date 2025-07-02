import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import { DMSConfig, SessionInfo } from '../types/dms.js';
// We'll create individual DMS service instances per session

interface UserSession {
  sessionId: string;
  dmsConfig: DMSConfig;
  dmsService: DMSService;
  createdAt: Date;
  lastActivity: Date;
  isConnected: boolean;
}

class SessionManager extends EventEmitter {
  private sessions: Map<string, UserSession> = new Map();
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes

  constructor() {
    super();
    this.startCleanupInterval();
  }

  // Create a new session with user-provided credentials
  createSession(config: DMSConfig): string {
    const sessionId = uuidv4();
    
    // Hash sensitive data for logging (don't log actual secrets)
    const configHash = crypto.createHash('sha256').update(config.jwt_secret).digest('hex').substring(0, 8);
    
    logger.info('Creating new DMS session', {
      sessionId,
      channel_id: config.channel_id,
      api_url: config.api_url,
      configHash
    });

    const dmsService = new DMSService();
    
    // Forward DMS events to the session manager
    dmsService.on('connected', (data) => {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isConnected = true;
        session.lastActivity = new Date();
      }
      this.emit('sessionConnected', { sessionId, ...data });
    });

    dmsService.on('disconnected', () => {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isConnected = false;
      }
      this.emit('sessionDisconnected', { sessionId });
    });

    dmsService.on('message', (message) => {
      this.updateActivity(sessionId);
      this.emit('sessionMessage', { sessionId, message });
    });

    dmsService.on('activity', (activity) => {
      this.updateActivity(sessionId);
      this.emit('sessionActivity', { sessionId, activity });
    });

    const session: UserSession = {
      sessionId,
      dmsConfig: config,
      dmsService,
      createdAt: new Date(),
      lastActivity: new Date(),
      isConnected: false
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  // Connect to DMS using session credentials
  async connectSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      await session.dmsService.connect(session.dmsConfig);
      session.isConnected = true;
      session.lastActivity = new Date();
      
      logger.info('Session connected to DMS', { sessionId });
    } catch (error) {
      logger.error('Failed to connect session to DMS', { sessionId, error });
      throw error;
    }
  }

  // Get DMS service for a session
  getDMSService(sessionId: string): DMSService | null {
    const session = this.sessions.get(sessionId);
    return session ? session.dmsService : null;
  }

  // Get session info
  getSession(sessionId: string): UserSession | null {
    return this.sessions.get(sessionId) || null;
  }

  // Update session activity
  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  // Disconnect and remove session
  async destroySession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    try {
      await session.dmsService.disconnect();
    } catch (error) {
      logger.error('Error disconnecting session DMS service', { sessionId, error });
    }

    this.sessions.delete(sessionId);
    logger.info('Session destroyed', { sessionId });
    this.emit('sessionDestroyed', { sessionId });
  }

  // Get all active sessions (for admin/debugging)
  getActiveSessions(): Array<{
    sessionId: string;
    channel_id: string;
    api_url: string;
    isConnected: boolean;
    createdAt: Date;
    lastActivity: Date;
  }> {
    return Array.from(this.sessions.values()).map(session => ({
      sessionId: session.sessionId,
      channel_id: session.dmsConfig.channel_id,
      api_url: session.dmsConfig.api_url,
      isConnected: session.isConnected,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    }));
  }

  // Validate session credentials (basic validation)
  static validateCredentials(config: DMSConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.jwt_secret || config.jwt_secret.length < 10) {
      errors.push('JWT Secret must be at least 10 characters');
    }

    if (!config.channel_id || config.channel_id.trim().length === 0) {
      errors.push('Channel ID is required');
    }

    if (!config.api_url || !config.api_url.startsWith('http')) {
      errors.push('Valid API URL is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Clean up expired sessions
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = new Date();
      const expiredSessions: string[] = [];

      for (const [sessionId, session] of this.sessions) {
        const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
        if (timeSinceActivity > this.sessionTimeout) {
          expiredSessions.push(sessionId);
        }
      }

      // Clean up expired sessions
      expiredSessions.forEach(sessionId => {
        logger.info('Cleaning up expired session', { sessionId });
        this.destroySession(sessionId);
      });

    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    logger.info('Shutting down session manager');
    
    const disconnectPromises = Array.from(this.sessions.keys()).map(sessionId => 
      this.destroySession(sessionId)
    );

    await Promise.all(disconnectPromises);
    this.sessions.clear();
  }
}

export const sessionManager = new SessionManager();
export default sessionManager;