import { createClient } from '@supabase/supabase-js'

// Prefer Vite env vars
const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  // Intentionally avoid logging secrets; only warn about placeholders
  // eslint-disable-next-line no-console
  console.warn('⚠️ Supabase env vars are not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          destination: string
          start_date: string
          end_date: string
          budget: number
          status: 'planned' | 'ongoing' | 'completed'
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          destination: string
          start_date: string
          end_date: string
          budget: number
          status?: 'planned' | 'ongoing' | 'completed'
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          destination?: string
          start_date?: string
          end_date?: string
          budget?: number
          status?: 'planned' | 'ongoing' | 'completed'
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      destinations: {
        Row: {
          id: string
          name: string
          country: string
          image_url: string
          rating: number
          price_range: string
          best_time: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          image_url: string
          rating: number
          price_range: string
          best_time: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          image_url?: string
          rating?: number
          price_range?: string
          best_time?: string
          description?: string
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          category: string
          amount: number
          description: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          category: string
          amount: number
          description: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          category?: string
          amount?: number
          description?: string
          date?: string
          created_at?: string
        }
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          message: string
          response: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          response: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          response?: string
          created_at?: string
        }
      }
    }
  }
}
