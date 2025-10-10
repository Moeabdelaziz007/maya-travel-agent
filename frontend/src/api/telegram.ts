// Telegram API Integration
import {
  getTelegramUser,
  getInitData,
  isTelegramWebApp,
} from '../telegram-webapp';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
  photo_url?: string;
}

export interface Trip {
  // Define the structure of a Trip object
  id: string | number;
  destination: string;
  startDate: string;
  endDate: string;
  // ... other properties
}

export interface BotCommand {
  command: string;
  description: string;
}

type ApiResponse<T> = { success: boolean; error?: string } & T;

export class TelegramService {
  private static baseURL = '/api/telegram';
  private static currentUser: TelegramUser | null | undefined = undefined;

  // Get current Telegram user
  static getCurrentUser(): TelegramUser | null {
    if (!isTelegramWebApp()) {
      return null;
    }
    // Cache the user object to avoid repeated calls
    if (this.currentUser === undefined) {
      this.currentUser = getTelegramUser();
    }

    return this.currentUser;
  }

  // Get chat information
  static getChatInfo(): TelegramChat | null {
    if (!isTelegramWebApp()) {
      return null;
    }

    const initData = getInitData();
    if (initData?.chat) {
      return initData.chat;
    }

    return null; // Or handle as needed if chat info is not present
  }

  // Send message to user
  static async sendMessage(
    message: string,
    chatId?: number
  ): Promise<{ success: boolean; error?: string }> {
    return this.post('/send-message', { message, chat_id: chatId });
  }

  // Send payment link to user
  static async sendPaymentLink(
    amount: number,
    description: string,
    chatId?: number
  ): Promise<ApiResponse<{ paymentLink?: string }>> {
    return this.post('/send-payment-link', {
      amount,
      description,
      chat_id: chatId,
    });
  }

  // Share trip with user
  static async shareTrip(
    tripData: Trip,
    chatId?: number
  ): Promise<{ success: boolean; error?: string }> {
    return this.post('/share-trip', { trip: tripData, chat_id: chatId });
  }

  // Get user's trips from Telegram
  static async getUserTrips(): Promise<ApiResponse<{ trips?: Trip[] }>> {
    return this.get('/user-trips');
  }

  // Sync user data with Telegram
  static async syncUserData(
    userData: Partial<TelegramUser>
  ): Promise<{ success: boolean; error?: string }> {
    return this.post('/sync-user', userData);
  }

  // Get bot commands
  static async getBotCommands(): Promise<
    ApiResponse<{ commands?: BotCommand[] }>
  > {
    return this.get('/bot-commands');
  }

  // Send notification to user
  static async sendNotification(
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): Promise<{ success: boolean; error?: string }> {
    return this.post('/send-notification', { message, type });
  }

  private static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request(endpoint, { method: 'GET' });
  }

  private static async post<T>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return this.request(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, options);

      if (!response.ok) {
        // Attempt to parse error from body, otherwise use status text
        let errorBody;
        try {
          errorBody = await response.json();
        } catch {
          // Ignore if body is not json
        }
        const errorMessage =
          errorBody?.error || response.statusText || 'Server error';
        return { success: false, error: errorMessage } as ApiResponse<T>;
      }

      const data = await response.json();
      return {
        success: data.success ?? false,
        ...data,
        error: data.error,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      } as ApiResponse<T>;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return Boolean(isTelegramWebApp() && this.getCurrentUser() !== null);
  }

  // Get user display name
  static getUserDisplayName(): string {
    const user = this.getCurrentUser();
    if (!user) return 'Guest';

    if (user.username) {
      return `@${user.username}`;
    }

    return user.first_name + (user.last_name ? ` ${user.last_name}` : '');
  }

  // Get user avatar
  static getUserAvatar(): string | null {
    const user = this.getCurrentUser();
    return user?.photo_url || null;
  }

  // Format user info for display
  static formatUserInfo(): string {
    const user = this.getCurrentUser();
    if (!user) return 'Not logged in';

    let info = user.first_name;
    if (user.last_name) {
      info += ` ${user.last_name}`;
    }
    if (user.username) {
      info += ` (@${user.username})`;
    }
    if (user.is_premium === true) {
      info += ' ⭐';
    }

    return info;
  }
}
