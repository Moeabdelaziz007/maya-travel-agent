export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_generated_trips: {
        Row: {
          booking_status: string | null
          budget: number | null
          conversation_id: string | null
          created_at: string | null
          destination: string
          end_date: string | null
          id: string
          itinerary: Json | null
          preferences: Json | null
          start_date: string | null
          travelers_count: number | null
          updated_at: string | null
          user_profile_id: string | null
        }
        Insert: {
          booking_status?: string | null
          budget?: number | null
          conversation_id?: string | null
          created_at?: string | null
          destination: string
          end_date?: string | null
          id?: string
          itinerary?: Json | null
          preferences?: Json | null
          start_date?: string | null
          travelers_count?: number | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Update: {
          booking_status?: string | null
          budget?: number | null
          conversation_id?: string | null
          created_at?: string | null
          destination?: string
          end_date?: string | null
          id?: string
          itinerary?: Json | null
          preferences?: Json | null
          start_date?: string | null
          travelers_count?: number | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_trips_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_trips_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          channel: Database["public"]["Enums"]["conversation_channel"]
          created_at: string | null
          detected_preferences: Json | null
          id: string
          messages: Json | null
          sentiment: string | null
          trip_intent: string | null
          updated_at: string | null
          user_profile_id: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["conversation_channel"]
          created_at?: string | null
          detected_preferences?: Json | null
          id?: string
          messages?: Json | null
          sentiment?: string | null
          trip_intent?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["conversation_channel"]
          created_at?: string | null
          detected_preferences?: Json | null
          id?: string
          messages?: Json | null
          sentiment?: string | null
          trip_intent?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_destinations: {
        Row: {
          created_at: string | null
          destination: string
          id: string
          notes: string | null
          user_id: string
          visited: boolean | null
          visited_date: string | null
        }
        Insert: {
          created_at?: string | null
          destination: string
          id?: string
          notes?: string | null
          user_id: string
          visited?: boolean | null
          visited_date?: string | null
        }
        Update: {
          created_at?: string | null
          destination?: string
          id?: string
          notes?: string | null
          user_id?: string
          visited?: boolean | null
          visited_date?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          status: string
          stripe_payment_intent_id: string | null
          user_profile_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          status: string
          stripe_payment_intent_id?: string | null
          user_profile_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          active: boolean | null
          alert_type: string | null
          created_at: string | null
          current_price: number | null
          destination: string
          id: string
          target_price: number | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          alert_type?: string | null
          created_at?: string | null
          current_price?: number | null
          destination: string
          id?: string
          target_price?: number | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          alert_type?: string | null
          created_at?: string | null
          current_price?: number | null
          destination?: string
          id?: string
          target_price?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accessibility_needs: string | null
          avatar_url: string | null
          budget_preference: string | null
          created_at: string | null
          dietary_restrictions: string[] | null
          full_name: string | null
          id: string
          preferred_languages: string[] | null
          travel_style: string | null
          updated_at: string | null
        }
        Insert: {
          accessibility_needs?: string | null
          avatar_url?: string | null
          budget_preference?: string | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          full_name?: string | null
          id: string
          preferred_languages?: string[] | null
          travel_style?: string | null
          updated_at?: string | null
        }
        Update: {
          accessibility_needs?: string | null
          avatar_url?: string | null
          budget_preference?: string | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          full_name?: string | null
          id?: string
          preferred_languages?: string[] | null
          travel_style?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trips: {
        Row: {
          booking_status: string | null
          budget: number | null
          created_at: string | null
          destination: string
          end_date: string | null
          id: string
          itinerary: Json | null
          preferences: Json | null
          start_date: string | null
          travelers_count: number | null
          trip_style: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_status?: string | null
          budget?: number | null
          created_at?: string | null
          destination: string
          end_date?: string | null
          id?: string
          itinerary?: Json | null
          preferences?: Json | null
          start_date?: string | null
          travelers_count?: number | null
          trip_style?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_status?: string | null
          budget?: number | null
          created_at?: string | null
          destination?: string
          end_date?: string | null
          id?: string
          itinerary?: Json | null
          preferences?: Json | null
          start_date?: string | null
          travelers_count?: number | null
          trip_style?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          budget_range: string | null
          created_at: string | null
          dietary_preferences: string[] | null
          email: string | null
          favorite_destinations: string[] | null
          full_name: string | null
          id: string
          last_active_at: string | null
          preferred_language: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          subscription_tier: string | null
          telegram_id: string | null
          travel_style: string[] | null
          trial_messages_limit: number | null
          trial_messages_used: number | null
          updated_at: string | null
          user_id: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          budget_range?: string | null
          created_at?: string | null
          dietary_preferences?: string[] | null
          email?: string | null
          favorite_destinations?: string[] | null
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          preferred_language?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          subscription_tier?: string | null
          telegram_id?: string | null
          travel_style?: string[] | null
          trial_messages_limit?: number | null
          trial_messages_used?: number | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          budget_range?: string | null
          created_at?: string | null
          dietary_preferences?: string[] | null
          email?: string | null
          favorite_destinations?: string[] | null
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          preferred_language?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          subscription_tier?: string | null
          telegram_id?: string | null
          travel_style?: string[] | null
          trial_messages_limit?: number | null
          trial_messages_used?: number | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          messages: Json | null
          phone_number: string
          user_profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          messages?: Json | null
          phone_number: string
          user_profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          messages?: Json | null
          phone_number?: string
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      conversation_channel: "whatsapp" | "telegram" | "web"
      subscription_status: "trial" | "active" | "cancelled" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      conversation_channel: ["whatsapp", "telegram", "web"],
      subscription_status: ["trial", "active", "cancelled", "expired"],
    },
  },
} as const
