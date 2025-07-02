// API service for communicating with the DMS backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

interface DMSConfig {
  customer_id: string;
  jwt_secret: string;
  channel_id: string;
  api_url: string;
}

interface SendMessageRequest {
  customer_id: string;
  message: string;
  message_type?: 'text' | 'rich_content';
  metadata?: Record<string, any>;
}

interface ActivityLog {
  id: string;
  timestamp: Date;
  type: 'request' | 'response' | 'error' | 'system';
  method?: string;
  endpoint?: string;
  status_code?: number;
  message: string;
  data?: Record<string, any>;
  duration_ms?: number;
}

interface DMSMessage {
  id: string;
  customer_id: string;
  message_type: 'text' | 'menu' | 'carousel' | 'url_link' | 'typing' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class DMSApi {
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;
  private eventListeners: { [key: string]: Function[] } = {};

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Event management
  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // HTTP request helper
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data: ApiResponse<T> = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // WebSocket connection
  connectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection.close();
    }

    const wsUrl = this.baseUrl.replace(/^http/, 'ws');
    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onopen = () => {
      console.log('WebSocket connected');
      this.emit('ws_connected', {});
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        
        switch (message.type) {
          case 'message':
            this.emit('message', message.data);
            break;
          case 'activity':
            this.emit('activity', message.data);
            break;
          case 'status':
            this.emit('status', message.data);
            break;
          case 'error':
            this.emit('error', message.data);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.wsConnection.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('ws_disconnected', {});
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (!this.wsConnection || this.wsConnection.readyState === WebSocket.CLOSED) {
          this.connectWebSocket();
        }
      }, 3000);
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('ws_error', error);
    };
  }

  disconnectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  // API endpoints
  async connect(config: DMSConfig): Promise<ApiResponse> {
    return this.request('/api/connect', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async sendMessage(request: SendMessageRequest): Promise<ApiResponse> {
    return this.request('/api/send-message', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async endSession(customerId: string, reason?: string): Promise<ApiResponse> {
    return this.request('/api/end-session', {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId, reason }),
    });
  }

  async getStatus(): Promise<ApiResponse> {
    return this.request('/api/status');
  }

  async getActivity(limit: number = 100): Promise<ApiResponse<{ logs: ActivityLog[]; count: number }>> {
    return this.request(`/api/activity?limit=${limit}`);
  }

  async getSessions(): Promise<ApiResponse> {
    return this.request('/api/sessions');
  }

  async healthCheck(): Promise<ApiResponse> {
    return this.request('/api/health');
  }
}

// Create singleton instance
export const dmsApi = new DMSApi();
export default dmsApi;

// Export types for use in components
export type { 
  ApiResponse, 
  DMSConfig, 
  SendMessageRequest, 
  ActivityLog, 
  DMSMessage 
};