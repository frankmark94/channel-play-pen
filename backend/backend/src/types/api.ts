import { Request } from 'express';

export interface ConnectRequest {
  customer_id: string;
  jwt_secret: string;
  channel_id: string;
  api_url: string;
}

export interface SendMessageRequest {
  customer_id: string;
  message: string;
  message_type?: 'text' | 'rich_content';
  metadata?: Record<string, any>;
}

export interface EndSessionRequest {
  customer_id: string;
  reason?: string;
}

export interface WebSocketMessage {
  type: 'message' | 'activity' | 'status' | 'error' | 'pong' | 'subscribed';
  data: any;
  timestamp: Date;
}

export interface AuthenticatedRequest extends Request {
  dmsConfig?: {
    jwt_secret: string;
    channel_id: string;
    api_url: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}