import { healthCheck } from './services';

// Test backend connection
export const testBackendConnection = async () => {
  try {
    console.log('🔄 Testing backend connection...');
    const response = await healthCheck();
    console.log('✅ Backend connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Test API endpoints
export const testAPIEndpoints = async () => {
  const tests = [
    { name: 'Health Check', test: healthCheck },
    // Add more tests as needed
  ];

  const results = [];

  for (const { name, test } of tests) {
    try {
      console.log(`🔄 Testing ${name}...`);
      const response = await test();
      console.log(`✅ ${name} successful:`, response.data);
      results.push({ name, success: true, data: response.data });
    } catch (error) {
      console.error(`❌ ${name} failed:`, error);
      results.push({
        name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
};
