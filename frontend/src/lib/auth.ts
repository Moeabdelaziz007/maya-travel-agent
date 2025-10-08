import { supabase } from './supabase'
import { Session, AuthError } from '@supabase/supabase-js'
import MockAuthService from './mockAuth'

// Check if we should use mock auth (when Supabase is not configured)
const USE_MOCK_AUTH = !(import.meta as any).env?.VITE_SUPABASE_URL || 
                      (import.meta as any).env?.VITE_SUPABASE_URL?.includes('your-project') ||
                      (import.meta as any).env?.VITE_SUPABASE_ANON_KEY?.includes('placeholder');

// Auth service for Maya Trips
export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, fullName?: string) {
    if (USE_MOCK_AUTH) {
      return MockAuthService.signUp(email, password, fullName);
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    if (USE_MOCK_AUTH) {
      return MockAuthService.signIn(email, password);
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // Sign in with Google
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // Sign in with GitHub
  static async signInWithGitHub() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // Sign out
  static async signOut() {
    if (USE_MOCK_AUTH) {
      return MockAuthService.signOut();
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Get current user
  static async getCurrentUser() {
    if (USE_MOCK_AUTH) {
      return MockAuthService.getCurrentUser();
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error: error as AuthError }
    }
  }

  // Get current session
  static async getCurrentSession() {
    if (USE_MOCK_AUTH) {
      return MockAuthService.getCurrentSession();
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return { session, error: null }
    } catch (error) {
      return { session: null, error: error as AuthError }
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // Update user profile
  static async updateProfile(updates: { full_name?: string; avatar_url?: string }) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    if (USE_MOCK_AUTH) {
      return MockAuthService.onAuthStateChange(callback);
    }

    return supabase.auth.onAuthStateChange(callback)
  }
}
