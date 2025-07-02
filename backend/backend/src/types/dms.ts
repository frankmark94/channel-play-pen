export interface DMSConfig {
  jwt_secret: string;
  channel_id: string;
  api_url: string;
  webhook_url?: string;
}

export interface DMSMessage {
  id: string;
  customer_id: string;
  message_type: 'text' | 'menu' | 'carousel' | 'url_link' | 'typing' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TextMessage {
  customer_id: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface MenuMessage {
  customer_id: string;
  title: string;
  options: MenuOption[];
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface MenuOption {
  id: string;
  text: string;
  value: string;
}

export interface CarouselMessage {
  customer_id: string;
  cards: CarouselCard[];
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CarouselCard {
  title: string;
  subtitle?: string;
  image_url?: string;
  actions: CardAction[];
}

export interface CardAction {
  type: 'postback' | 'url';
  title: string;
  value: string;
}

export interface UrlLinkMessage {
  customer_id: string;
  url: string;
  display_text: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SessionInfo {
  customer_id: string;
  channel_id: string;
  session_id: string;
  status: 'active' | 'ended' | 'error';
  created_at: Date;
  ended_at?: Date;
}

export interface ActivityLog {
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}