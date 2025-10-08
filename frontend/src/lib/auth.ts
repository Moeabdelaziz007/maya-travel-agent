import { supabase } from './supabase'
import { Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { UserService } from './database'

// Auth service for Maya Trips
export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, fullName?: string) {
    console.log('🔐 AuthService.signUp called:', { email, hasPassword: !!password, fullName })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      console.log('🔐 AuthService.signUp result:', { success: !error, userId: data?.user?.id, error: error?.message })

      if (error) throw error
      // Provision profile row for user if available (may be null until email confirmed depending on project settings)
      if (data?.user) {
        await UserService.ensureUserProfile({
          id: data.user.id,
          email: data.user.email || email,
          full_name: (data.user.user_metadata as any)?.full_name ?? fullName ?? null,
          avatar_url: (data.user.user_metadata as any)?.avatar_url ?? null,
        })
      }
      return { data, error: null }
    } catch (error) {
      console.error('🔐 AuthService.signUp error:', error)
      return { data: null, error: error as AuthError }
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    console.log('🔐 AuthService.signIn called:', { email, hasPassword: !!password })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔐 AuthService.signIn result:', { success: !error, userId: data?.user?.id, error: error?.message })

      if (error) throw error
      if (data?.user) {
        await UserService.ensureUserProfile({
          id: data.user.id,
          email: data.user.email || email,
          full_name: (data.user.user_metadata as any)?.full_name ?? null,
          avatar_url: (data.user.user_metadata as any)?.avatar_url ?? null,
        })
      }
      return { data, error: null }
    } catch (error) {
      console.error('🔐 AuthService.signIn error:', error)
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
        redirectTo: `${window.location.origin}/auth/reset-password`,
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
  static onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      // Best-effort ensure profile on session-authenticated events
      const user = session?.user
      if (user) {
        await UserService.ensureUserProfile({
          id: user.id,
          email: user.email || '',
          full_name: (user.user_metadata as any)?.full_name ?? null,
          avatar_url: (user.user_metadata as any)?.avatar_url ?? null,
        })
      }
      callback(event, session)
    })
  }
}
