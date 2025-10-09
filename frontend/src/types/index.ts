/**
 * @fileoverview Type definitions for Maya Travel Agent
 * @module types
 */

/**
 * User profile from Supabase
 */
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Trip status enum
 */
export type TripStatus = 'planned' | 'ongoing' | 'completed';

/**
 * Trip data structure
 */
export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: TripStatus;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Destination information
 */
export interface Destination {
  id: string;
  name: string;
  country: string;
  image_url: string;
  rating: number;
  price_range: string;
  best_time: string;
  description: string;
  created_at: string;
}

/**
 * Expense category
 */
export type ExpenseCategory = 
  | 'accommodation'
  | 'transportation'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'other';

/**
 * Expense record
 */
export interface Expense {
  id: string;
  trip_id: string;
  user_id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

/**
 * AI conversation message
 */
export interface AIMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
}

/**
 * AI chat request
 */
export interface AIChatRequest {
  message: string;
  userId?: string;
  conversationHistory?: ConversationMessage[];
  useTools?: boolean;
  region?: 'ar' | 'en';
}

/**
 * Conversation message
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * AI chat response
 */
export interface AIChatResponse {
  success: boolean;
  reply: string;
  timestamp: string;
  model: string;
  error?: string;
}

/**
 * Payment method type
 */
export type PaymentMethod = 'stripe' | 'paypal' | 'telegram';

/**
 * Payment link data
 */
export interface PaymentLink {
  id: string;
  url: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
}

/**
 * Payment request
 */
export interface PaymentRequest {
  amount: number;
  currency?: string;
  description?: string;
  customerEmail?: string;
}

/**
 * Payment response
 */
export interface PaymentResponse {
  success: boolean;
  paymentLink?: PaymentLink;
  payment?: any;
  message?: string;
  error?: string;
}

/**
 * Telegram user data
 */
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

/**
 * Telegram WebApp data
 */
export interface TelegramWebAppData {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
}

/**
 * API error response
 */
export interface APIError {
  success: false;
  error: string;
  message?: string;
  code?: string;
  retryAfter?: number;
}

/**
 * API success response
 */
export interface APISuccess<T = any> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * API response type
 */
export type APIResponse<T = any> = APISuccess<T> | APIError;

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  type: string;
  userId?: string;
  payload?: Record<string, any>;
}

/**
 * Form validation error
 */
export interface FormError {
  field: string;
  message: string;
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

/**
 * Notification type
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

/**
 * Travel preferences
 */
export interface TravelPreferences {
  budget_max?: number;
  travel_style?: 'budget' | 'standard' | 'luxury';
  preferred_destinations?: string[];
  interests?: string[];
}

/**
 * User profile with Telegram data
 */
export interface UserProfile {
  telegram_id: string;
  username?: string;
  avatar_url?: string;
  preferences?: TravelPreferences;
  travel_history?: any[];
  created_at: string;
  updated_at: string;
}

/**
 * Travel offer
 */
export interface TravelOffer {
  id: string;
  title: string;
  destination: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  category: 'budget' | 'standard' | 'luxury' | 'family';
  duration_days: number;
  includes: string[];
  image_url?: string;
  is_active: boolean;
  priority: number;
  valid_until?: string;
  created_at: string;
}

/**
 * Multimodal analysis request
 */
export interface MultimodalAnalysisRequest {
  prompt?: string;
  imageUrls?: string[];
  videoUrl?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    enableKvCacheOffload?: boolean;
    attentionImpl?: string;
  };
}

/**
 * Multimodal analysis response
 */
export interface MultimodalAnalysisResponse {
  success: boolean;
  analysis: string;
  providerData?: any;
  timestamp: string;
  error?: string;
}
