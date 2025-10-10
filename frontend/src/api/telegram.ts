// Telegram API Integration
import { getTelegramUser, getInitData, isTelegramWebApp } from '../telegram-webapp';

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

export class TelegramService {
  private static baseURL = '/api/telegram';

  // Get current Telegram user
  static getCurrentUser(): TelegramUser | null {
    if (!isTelegramWebApp()) {
      return null;
    }
    
    return getTelegramUser();
  }

  // Get chat information
  static getChatInfo(): TelegramChat | null {
    if (!isTelegramWebApp()) {
      return null;
    }

    // Parse init data to get chat info
    // This would need to be implemented based on your backend parsing
    return null;
  }

  // Send message to user
  static async sendMessage(message: string, chatId?: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          chat_id: chatId,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Send payment link to user
  static async sendPaymentLink(amount: number, description: string, chatId?: number): Promise<{ success: boolean; paymentLink?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/send-payment-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          chat_id: chatId,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Share trip with user
  static async shareTrip(tripData: any, chatId?: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/share-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trip: tripData,
          chat_id: chatId,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Get user's trips from Telegram
  static async getUserTrips(): Promise<{ success: boolean; trips?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/user-trips`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Sync user data with Telegram
  static async syncUserData(userData: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/sync-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Get bot commands
  static async getBotCommands(): Promise<{ success: boolean; commands?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/bot-commands`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Send notification to user
  static async sendNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          type,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
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
    if (user.is_premium) {
      info += ' ⭐';
    }
    
    return info;
  }
}
