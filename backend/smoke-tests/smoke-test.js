/**
 * Smoke Tests for Amriyy Travel Agent
 * Quick validation tests to run after deployment
 *
 * Run with: npm run smoke-test
 */

const axios = require('axios');
const chalk = require('chalk');

// Configuration
const config = {
  baseURL: process.env.TEST_URL || 'http://localhost:3001',
  apiKey: process.env.TEST_API_KEY || 'test-key',
  timeout: 30000,
};

// Test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [],
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: chalk.blue('ℹ'),
    success: chalk.green('✓'),
    error: chalk.red('✗'),
    warn: chalk.yellow('⚠'),
  }[type];

  console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordTest(name, passed, error = null) {
  results.total++;
  if (passed) {
    results.passed++;
    log(`${name}: PASSED`, 'success');
  } else {
    results.failed++;
    log(`${name}: FAILED - ${error}`, 'error');
  }

  results.tests.push({ name, passed, error });
}

async function runTest(name, testFn) {
  try {
    await testFn();
    recordTest(name, true);
  } catch (error) {
    recordTest(name, false, error.message);
  }
}

// Test Suite
async function runSmokeTests() {
  log('🚀 Starting Amriyy Travel Agent Smoke Tests', 'info');
  log(`Target URL: ${config.baseURL}`, 'info');
  log('─'.repeat(60), 'info');

  // Test 1: Health Check
  await runTest('Health Check', async () => {
    const response = await axios.get(`${config.baseURL}/health`, {
      timeout: config.timeout,
    });

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    if (response.data.status !== 'ok') {
      throw new Error(`Health check returned status: ${response.data.status}`);
    }
  });

  // Test 2: Metrics Endpoint
  await runTest('Metrics Endpoint', async () => {
    const response = await axios.get(`${config.baseURL}/metrics`, {
      timeout: config.timeout,
    });

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    if (!response.data.includes('http_request_duration')) {
      throw new Error('Prometheus metrics not found');
    }
  });

  // Test 3: Boss Agent Orchestration
  await runTest('Boss Agent Orchestration', async () => {
    const response = await axios.post(
      `${config.baseURL}/api/v1/trip`,
      {
        userId: 'smoke-test-user',
        message: 'I want to plan a trip to Tokyo',
        budget: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        timeout: config.timeout,
      }
    );

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    if (!response.data.success) {
      throw new Error('Orchestration failed');
    }

    if (!response.data.data) {
      throw new Error('No data in response');
    }
  });

  // Test 4: AI Chat Endpoint
  await runTest('AI Chat Endpoint', async () => {
    const response = await axios.post(
      `${config.baseURL}/api/v1/chat`,
      {
        userId: 'smoke-test-user',
        message: 'مرحباً! ما هي أفضل وجهة سياحية في الصيف؟',
        conversationId: 'smoke-test-conv',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        timeout: config.timeout,
      }
    );

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    if (!response.data.reply) {
      throw new Error('No AI reply in response');
    }
  });

  // Test 5: Skills System
  await runTest('Skills System - Empathy Detection', async () => {
    const response = await axios.post(
      `${config.baseURL}/api/v1/skills/empathy`,
      {
        message: 'أنا قلقان جداً بخصوص الرحلة',
        language: 'ar',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        timeout: config.timeout,
      }
    );

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    if (!response.data.success) {
      throw new Error('Empathy detection failed');
    }

    if (!response.data.data.primary_emotion) {
      throw new Error('No emotion detected');
    }
  });

  // Test 6: Rate Limiting
  await runTest('Rate Limiting', async () => {
    let rateLimited = false;

    // Make 110 rapid requests to trigger rate limit (limit is 100/minute)
    for (let i = 0; i < 110; i++) {
      try {
        await axios.get(`${config.baseURL}/health`, { timeout: 1000 });
      } catch (error) {
        if (error.response && error.response.status === 429) {
          rateLimited = true;
          break;
        }
      }
    }

    if (!rateLimited) {
      throw new Error('Rate limiting not working');
    }
  });

  // Test 7: Error Handling
  await runTest('Error Handling - Invalid Input', async () => {
    try {
      await axios.post(
        `${config.baseURL}/api/v1/trip`,
        {
          // Invalid request - missing required fields
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          timeout: config.timeout,
        }
      );

      throw new Error('Should have returned error for invalid input');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Expected error
        return;
      }
      throw error;
    }
  });

  // Test 8: Concurrent Requests
  await runTest('Concurrent Request Handling', async () => {
    const requests = Array(10)
      .fill(null)
      .map((_, i) =>
        axios.post(
          `${config.baseURL}/api/v1/chat`,
          {
            userId: `concurrent-user-${i}`,
            message: 'Test message',
            conversationId: `concurrent-conv-${i}`,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${config.apiKey}`,
            },
            timeout: config.timeout,
          }
        )
      );

    const responses = await Promise.all(requests);

    const allSuccessful = responses.every((r) => r.status === 200);
    if (!allSuccessful) {
      throw new Error('Not all concurrent requests succeeded');
    }
  });

  // Print results
  log('─'.repeat(60), 'info');
  log(`✅ Tests Passed: ${results.passed}/${results.total}`, 'success');
  log(`❌ Tests Failed: ${results.failed}/${results.total}`, 'error');
  log(
    `📊 Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`,
    'info'
  );

  // Exit with appropriate code
  if (results.failed > 0) {
    log('🔴 Smoke tests FAILED', 'error');
    process.exit(1);
  } else {
    log('🟢 All smoke tests PASSED', 'success');
    process.exit(0);
  }
}

// Run tests
runSmokeTests().catch((error) => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
