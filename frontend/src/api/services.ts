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
  sendMessage: (message: string) => api.post('/ai/chat', { message }),
  
  // Get AI suggestions
  getSuggestions: (context: any) => api.post('/ai/suggestions', context)
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
