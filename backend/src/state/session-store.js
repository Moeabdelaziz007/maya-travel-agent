/**
 * In-Memory Session Store
 * Fast, reliable state management without external dependencies
 * Perfect for development and can be upgraded to Redis later
 */

class SessionStore {
  constructor() {
    this.sessions = new Map();
    this.expirationMs = 24 * 60 * 60 * 1000; // 24 hours

    // Cleanup expired sessions every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  saveState(userId, data) {
    const existing = this.sessions.get(userId) || {};

    this.sessions.set(userId, {
      ...existing,
      ...data,
      lastUpdated: Date.now(),
      expiresAt: Date.now() + this.expirationMs
    });

    console.log(`[SessionStore] ✅ State saved for user: ${userId}`);
    return true;
  }

  getState(userId) {
    const session = this.sessions.get(userId);

    if (!session) {
      console.log(`[SessionStore] ⚠️ No session found for: ${userId}`);
      return null;
    }

    // Check expiration
    if (session.expiresAt < Date.now()) {
      console.log(`[SessionStore] ⚠️ Session expired for: ${userId}`);
      this.sessions.delete(userId);
      return null;
    }

    console.log(`[SessionStore] ✅ State retrieved for: ${userId}`);
    return session;
  }

  deleteState(userId) {
    const deleted = this.sessions.delete(userId);
    console.log(`[SessionStore] ${deleted ? '✅' : '⚠️'} State deleted for: ${userId}`);
    return deleted;
  }

  hasState(userId) {
    return this.sessions.has(userId);
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [userId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(userId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[SessionStore] 🧹 Cleaned ${cleaned} expired sessions`);
    }
  }

  getStats() {
    return {
      activeSessions: this.sessions.size,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
    };
  }

  clear() {
    this.sessions.clear();
    console.log('[SessionStore] 🧹 All sessions cleared');
  }
}

// Singleton instance
const sessionStore = new SessionStore();

module.exports = sessionStore;