/**
 * Test Z.ai API Connection
 * Tests different endpoints and configurations
 */

require('dotenv').config();
const fetch = require('node-fetch');

const API_KEY = process.env.ZAI_API_KEY;

async function testEndpoint(baseUrl, model) {
  console.log(`\n🧪 Testing: ${baseUrl} with model: ${model}`);
  console.log('='.repeat(60));
  
  try {
    const requestBody = {
      model: model,
      messages: [
        { role: 'user', content: 'مرحبا' }
      ],
      max_tokens: 50,
      temperature: 0.7
    };

    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response:', text);
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      const data = JSON.parse(text);
      console.log('Content:', data.choices?.[0]?.message?.content || data);
      return true;
    } else {
      console.log('❌ FAILED');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Z.ai API Connection Test');
  console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 20)}...` : 'NOT SET');
  
  const tests = [
    // Test 1: Original configuration
    {
      baseUrl: 'https://api.z.ai/api/paas/v4',
      model: 'glm-4.6'
    },
    // Test 2: Try glm-4
    {
      baseUrl: 'https://api.z.ai/api/paas/v4',
      model: 'glm-4'
    },
    // Test 3: Try different version
    {
      baseUrl: 'https://api.z.ai/v1',
      model: 'glm-4.6'
    },
    // Test 4: Try OpenAI compatible endpoint
    {
      baseUrl: 'https://api.z.ai/v1',
      model: 'glm-4'
    }
  ];
  
  let successCount = 0;
  
  for (const test of tests) {
    const success = await testEndpoint(test.baseUrl, test.model);
    if (success) {
      successCount++;
      console.log('\n✅ Working configuration found!');
      console.log(`Base URL: ${test.baseUrl}`);
      console.log(`Model: ${test.model}`);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  }
  
  if (successCount === 0) {
    console.log('\n❌ All tests failed. Possible issues:');
    console.log('1. API key might need activation');
    console.log('2. Subscription might not be active yet');
    console.log('3. Different endpoint might be needed');
    console.log('\nPlease check:');
    console.log('- Z.ai dashboard: https://z.ai/dashboard');
    console.log('- API documentation: https://z.ai/docs');
    console.log('- Subscription status');
  }
}

runTests().catch(console.error);
