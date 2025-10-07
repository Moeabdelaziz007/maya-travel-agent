import { supabase } from './supabase'
import { Database } from './supabase'

type Tables = Database['public']['Tables']

// Trip service
export class TripService {
  // Get all trips for a user
  static async getTrips(userId: string) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get trip by ID
  static async getTrip(tripId: string) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Create new trip
  static async createTrip(trip: Tables['trips']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert(trip)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Update trip
  static async updateTrip(tripId: string, updates: Tables['trips']['Update']) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', tripId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Delete trip
  static async deleteTrip(tripId: string) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Destination service
export class DestinationService {
  // Get all destinations
  static async getDestinations() {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('rating', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Search destinations
  static async searchDestinations(query: string) {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .or(`name.ilike.%${query}%,country.ilike.%${query}%`)
        .order('rating', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get destination by ID
  static async getDestination(destinationId: string) {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', destinationId)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Expense service
export class ExpenseService {
  // Get expenses for a trip
  static async getExpenses(tripId: string) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', tripId)
        .order('date', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Add expense
  static async addExpense(expense: Tables['expenses']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Update expense
  static async updateExpense(expenseId: string, updates: Tables['expenses']['Update']) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', expenseId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Delete expense
  static async deleteExpense(expenseId: string) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// AI Conversation service
export class AIConversationService {
  // Get conversation history
  static async getConversations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Save conversation
  static async saveConversation(conversation: Tables['ai_conversations']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert(conversation)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}
