import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import { DMSConfig } from '../types/dms.js';

interface StoredCredentials {
  sessionId: string;
  config: DMSConfig;
  createdAt: Date;
  lastUsed: Date;
}

class CredentialManager {
  private credentials: Map<string, StoredCredentials> = new Map();
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.startCleanup();
  }

  // Store credentials and return a session ID
  storeCredentials(config: DMSConfig): string {
    const sessionId = uuidv4();
    
    // Hash JWT secret for logging (security)
    const secretHash = crypto.createHash('sha256').update(config.jwt_secret).digest('hex').substring(0, 8);
    
    logger.info('Storing credentials for session', {
      sessionId,
      channel_id: config.channel_id,
      api_url: config.api_url,
      jwt_secret_hash: secretHash
    });

    const stored: StoredCredentials = {
      sessionId,
      config,
      createdAt: new Date(),
      lastUsed: new Date()
    };

    this.credentials.set(sessionId, stored);
    return sessionId;
  }

  // Retrieve credentials by session ID
  getCredentials(sessionId: string): DMSConfig | null {
    const stored = this.credentials.get(sessionId);
    if (!stored) {
      return null;
    }

    // Update last used time
    stored.lastUsed = new Date();
    return stored.config;
  }

  // Remove credentials
  removeCredentials(sessionId: string): void {
    this.credentials.delete(sessionId);
    logger.info('Removed credentials for session', { sessionId });
  }

  // Validate credentials format
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

    // Basic JWT format check (should be base64-like)
    if (config.jwt_secret && !/^[A-Za-z0-9+/=_-]+$/.test(config.jwt_secret)) {
      errors.push('JWT Secret appears to have invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get active session count
  getActiveSessionCount(): number {
    return this.credentials.size;
  }

  // Clean up expired credentials
  private startCleanup(): void {
    setInterval(() => {
      const now = new Date();
      const expiredSessions: string[] = [];

      for (const [sessionId, stored] of this.credentials) {
        const timeSinceUsed = now.getTime() - stored.lastUsed.getTime();
        if (timeSinceUsed > this.sessionTimeout) {
          expiredSessions.push(sessionId);
        }
      }

      expiredSessions.forEach(sessionId => {
        logger.info('Cleaning up expired credentials', { sessionId });
        this.removeCredentials(sessionId);
      });

    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  // Shutdown cleanup
  shutdown(): void {
    this.credentials.clear();
    logger.info('Credential manager shutdown');
  }
}

export const credentialManager = new CredentialManager();
export default credentialManager;