/**
 * Mock Authentication Service
 * Works without Supabase for testing
 */

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

interface Session {
  user: User;
  access_token: string;
  expires_at: number;
}

class MockAuthService {
  private static STORAGE_KEY = 'maya_auth_session';
  private static users: Map<string, { email: string; password: string; user: User }> = new Map();

  // Initialize with demo user
  static {
    this.users.set('demo@mayatrips.com', {
      email: 'demo@mayatrips.com',
      password: 'demo123',
      user: {
        id: 'demo-user-1',
        email: 'demo@mayatrips.com',
        full_name: 'Demo User',
        created_at: new Date().toISOString()
      }
    });
  }

  static async signUp(email: string, password: string, fullName?: string) {
    try {
      // Check if user already exists
      if (this.users.has(email)) {
        return {
          data: null,
          error: { message: 'User already exists' }
        };
      }

      // Create new user
      const user: User = {
        id: `user-${Date.now()}`,
        email,
        full_name: fullName,
        created_at: new Date().toISOString()
      };

      this.users.set(email, { email, password, user });

      // Create session
      const session = this.createSession(user);
      this.saveSession(session);

      return {
        data: { user, session },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message }
      };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const userData = this.users.get(email);

      if (!userData) {
        return {
          data: null,
          error: { message: 'Invalid email or password' }
        };
      }

      if (userData.password !== password) {
        return {
          data: null,
          error: { message: 'Invalid email or password' }
        };
      }

      // Create session
      const session = this.createSession(userData.user);
      this.saveSession(session);

      return {
        data: { user: userData.user, session },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message }
      };
    }
  }

  static async signOut() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  static async getCurrentUser() {
    try {
      const session = this.getSession();
      if (!session) {
        return { user: null, error: null };
      }

      // Check if session expired
      if (Date.now() > session.expires_at) {
        this.signOut();
        return { user: null, error: null };
      }

      return { user: session.user, error: null };
    } catch (error: any) {
      return { user: null, error: { message: error.message } };
    }
  }

  static async getCurrentSession() {
    try {
      const session = this.getSession();
      return { session, error: null };
    } catch (error: any) {
      return { session: null, error: { message: error.message } };
    }
  }

  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    // Initial call
    const session = this.getSession();
    callback('INITIAL_SESSION', session);

    // Listen for storage changes
    const handler = (e: StorageEvent) => {
      if (e.key === this.STORAGE_KEY) {
        const newSession = e.newValue ? JSON.parse(e.newValue) : null;
        callback('SIGNED_IN', newSession);
      }
    };

    window.addEventListener('storage', handler);

    return {
      data: {
        subscription: {
          unsubscribe: () => window.removeEventListener('storage', handler)
        }
      }
    };
  }

  private static createSession(user: User): Session {
    return {
      user,
      access_token: `mock_token_${Date.now()}`,
      expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }

  private static saveSession(session: Session) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
  }

  private static getSession(): Session | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
}

export default MockAuthService;
