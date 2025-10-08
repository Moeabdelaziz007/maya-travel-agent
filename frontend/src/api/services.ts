import { api } from './client';

// Trip Services
export const tripService = {
  // Get all trips
  getTrips: () => api.get('/trips'),
  
  // Get trip by ID
  getTrip: (id: string) => api.get(`/trips/${id}`),
  
  // Create new trip
  createTrip: (tripData: any) => api.post('/trips', tripData),
  
  // Update trip
  updateTrip: (id: string, tripData: any) => api.put(`/trips/${id}`, tripData),
  
  // Delete trip
  deleteTrip: (id: string) => api.delete(`/trips/${id}`)
};

// Destination Services
export const destinationService = {
  // Get all destinations
  getDestinations: () => api.get('/destinations'),
  
  // Get destination by ID
  getDestination: (id: string) => api.get(`/destinations/${id}`),
  
  // Search destinations
  searchDestinations: (query: string) => api.get(`/destinations/search?q=${query}`)
};

// AI Assistant Services
export const aiService = {
  // Send message to AI
  sendMessage: (message: string, opts?: { useTools?: boolean; conversationHistory?: Array<{role: string; content: string}> }) =>
    api.post('/ai/chat', { message, useTools: !!opts?.useTools, conversationHistory: opts?.conversationHistory || [] }),
  
  // Get AI suggestions
  getSuggestions: (context: any) => api.post('/ai/suggestions', context),

  // Analyze images/videos for trip planning insights (URL-based)
  analyzeMedia: (params: { prompt?: string; imageUrls?: string[]; videoUrl?: string | null; options?: { temperature?: number; maxTokens?: number; enableKvCacheOffload?: boolean; attentionImpl?: string | null } }) =>
    api.post('/ai/multimodal/analyze', params),

  // Upload and analyze files (multimodal file upload)
  uploadAndAnalyzeFiles: async (files: File[], destination?: string, prompt?: string) => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (destination) {
      formData.append('destination', destination);
    }
    
    if (prompt) {
      formData.append('prompt', prompt);
    }
    
    return api.post('/ai/multimodal/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get performance statistics (KV cache, FlashAttention metrics)
  getPerformanceStats: () => api.get('/ai/performance'),

  // Clear AI cache
  clearCache: () => api.post('/ai/cache/clear')
};

// Analytics API
export const analyticsService = {
  track: (event: { type: string; userId?: string; payload?: any }) => api.post('/analytics/events', event),
  summary: () => api.get('/analytics/summary')
};

// Budget Services
export const budgetService = {
  // Get budget summary
  getBudgetSummary: (tripId?: string) => api.get(`/budget/summary${tripId ? `?tripId=${tripId}` : ''}`),
  
  // Add expense
  addExpense: (expenseData: any) => api.post('/budget/expenses', expenseData),
  
  // Get expenses
  getExpenses: (tripId?: string) => api.get(`/budget/expenses${tripId ? `?tripId=${tripId}` : ''}`)
};

// Health check
export const healthCheck = () => api.get('/health');
