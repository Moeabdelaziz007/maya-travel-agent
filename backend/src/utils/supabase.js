/**
 * Mock Supabase Client for Testing
 * Provides basic functionality for development and testing
 */

class MockSupabaseClient {
  constructor() {
    this.data = new Map();
    this.tables = new Map();
  }

  from(table) {
    return {
      select: (columns) => ({
        eq: (key, value) => ({
          single: async () => {
            const tableData = this.tables.get(table) || [];
            const record = tableData.find(item => item[key] === value);

            return {
              data: record || null,
              error: null
            };
          }
        }),
        upsert: async (data) => {
          if (!this.tables.has(table)) {
            this.tables.set(table, []);
          }

          const tableData = this.tables.get(table);

          // Simple upsert logic
          const existingIndex = tableData.findIndex(item => item.id === data.id);
          if (existingIndex >= 0) {
            tableData[existingIndex] = { ...tableData[existingIndex], ...data };
          } else {
            tableData.push({ ...data, id: Date.now().toString() });
          }

          return { error: null };
        }
      }),
      insert: async (data) => {
        if (!this.tables.has(table)) {
          this.tables.set(table, []);
        }

        const tableData = this.tables.get(table);
        const newRecord = { ...data, id: Date.now().toString() };
        tableData.push(newRecord);

        return {
          data: newRecord,
          error: null
        };
      }
    };
  }

  // Health check method
  async healthCheck() {
    return {
      status: 'healthy',
      message: 'Mock Supabase client is working'
    };
  }
}

// Export singleton instance for testing
module.exports = new MockSupabaseClient();