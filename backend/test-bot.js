/**
 * Bot Functionality Test Script
 * Tests all major bot features
 */

const logger = require('./utils/logger');
const conversationManager = require('./utils/conversationManager');
const healthMonitor = require('./utils/healthMonitor');
const ZaiClient = require('./src/ai/zaiClient');
const SupabaseDB = require('./database/supabase');

async function runTests() {
  logger.info('🧪 Starting bot functionality tests...');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test 1: Logger
  try {
    logger.info('Test log message');
    logger.debug('Test debug message');
    logger.warn('Test warning message');
    results.tests.push({ name: 'Logger', status: 'PASS' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Logger', status: 'FAIL', error: error.message });
    results.failed++;
  }
  
  // Test 2: Conversation Manager
  try {
    const testUserId = 'test_user_123';
    const context = await conversationManager.getContext(testUserId);
    await conversationManager.addMessage(testUserId, 'Test message', true);
    await conversationManager.setState(testUserId, conversationManager.states.COLLECTING_DESTINATION);
    const history = await conversationManager.getHistory(testUserId);
    const summary = await conversationManager.getSummary(testUserId);
    
    if (context && history.length > 0 && summary) {
      results.tests.push({ name: 'Conversation Manager', status: 'PASS' });
      results.passed++;
    } else {
      throw new Error('Conversation manager returned invalid data');
    }
  } catch (error) {
    results.tests.push({ name: 'Conversation Manager', status: 'FAIL', error: error.message });
    results.failed++;
  }
  
  // Test 3: Supabase DB
  try {
    const db = new SupabaseDB();
    const offers = await db.getTravelOffers();
    
    if (Array.isArray(offers)) {
      results.tests.push({ name: 'Supabase DB', status: 'PASS', note: `${offers.length} offers loaded` });
      results.passed++;
    } else {
      throw new Error('Invalid offers data');
    }
  } catch (error) {
    results.tests.push({ name: 'Supabase DB', status: 'FAIL', error: error.message });
    results.failed++;
  }
  
  // Test 4: Z.ai Client
  try {
    const zaiClient = new ZaiClient();
    const healthCheck = await zaiClient.healthCheck();
    
    if (healthCheck.status) {
      results.tests.push({ 
        name: 'Z.ai Client', 
        status: healthCheck.status === 'healthy' ? 'PASS' : 'WARN',
        note: healthCheck.status 
      });
      if (healthCheck.status === 'healthy') {
        results.passed++;
      } else {
        results.failed++;
      }
    } else {
      throw new Error('Health check failed');
    }
  } catch (error) {
    results.tests.push({ name: 'Z.ai Client', status: 'FAIL', error: error.message });
    results.failed++;
  }
  
  // Test 5: Health Monitor
  try {
    const health = healthMonitor.getHealth();
    const metrics = healthMonitor.getMetricsSummary();
    
    if (health && metrics) {
      results.tests.push({ 
        name: 'Health Monitor', 
        status: 'PASS',
        note: `System status: ${health.status}` 
      });
      results.passed++;
    } else {
      throw new Error('Health monitor returned invalid data');
    }
  } catch (error) {
    results.tests.push({ name: 'Health Monitor', status: 'FAIL', error: error.message });
    results.failed++;
  }
  
  // Test 6: Intent Analysis
  try {
    const testMessages = [
      'أريد السفر إلى تركيا',
      'ما هي ميزانية الرحلة؟',
      'متى أفضل وقت للسفر؟'
    ];
    
    let allPassed = true;
    for (const msg of testMessages) {
      const intent = conversationManager.analyzeIntent(msg);
      if (!intent) {
        allPassed = false;
        break;
      }
    }
    
    if (allPassed) {
      results.tests.push({ name: 'Intent Analysis', status: 'PASS' });
      results.passed++;
    } else {
      throw new Error('Intent analysis failed');
    }
  } catch (error) {
    results.tests.push({ name: 'Intent Analysis', status: 'FAIL', error: error.message });
    results.failed++;
  }
  
  // Test 7: Conversation Statistics
  try {
    const stats = conversationManager.getStatistics();
    
    if (stats && typeof stats.activeConversations === 'number') {
      results.tests.push({ 
        name: 'Conversation Statistics', 
        status: 'PASS',
        note: `${stats.activeConversations} active conversations` 
      });
      results.passed++;
    } else {
      throw new Error('Invalid statistics data');
    }
  } catch (error) {
    results.tests.push({ name: 'Conversation Statistics', status: 'FAIL', error: error.message });
    results.failed++;
  }
  
  // Print results
  logger.info('\n📊 Test Results:\n');
  console.log('═'.repeat(60));
  
  results.tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : test.status === 'WARN' ? '⚠️' : '❌';
    const note = test.note ? ` (${test.note})` : '';
    const error = test.error ? ` - ${test.error}` : '';
    console.log(`${icon} ${test.name}${note}${error}`);
  });
  
  console.log('═'.repeat(60));
  console.log(`\n📈 Summary: ${results.passed} passed, ${results.failed} failed`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%\n`);
  
  if (results.failed === 0) {
    logger.info('🎉 All tests passed!');
  } else {
    logger.warn(`⚠️ ${results.failed} test(s) failed`);
  }
  
  return results;
}

// Run tests
runTests()
  .then(results => {
    process.exit(results.failed === 0 ? 0 : 1);
  })
  .catch(error => {
    logger.error('Test execution failed', error);
    process.exit(1);
  });
