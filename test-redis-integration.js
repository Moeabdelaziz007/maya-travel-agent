#!/usr/bin/env node
/**
 * Redis Integration Test Script
 * Tests Redis functionality without starting full server
 */

require('dotenv').config();
const redisService = require('./backend/src/services/redis-service');

async function testRedisIntegration() {
  console.log('🧪 Testing Redis Integration...\n');

  try {
    // Test 1: Connection
    console.log('1️⃣ Testing Redis connection...');
    if (process.env.REDIS_HOST || process.env.REDIS_URL) {
      try {
        await redisService.connect();
        console.log('   ✅ Redis connected successfully');
      } catch (error) {
        console.log('   ❌ Redis connection failed:', error.message);
        console.log('   💡 Continuing with memory stores...');
      }
    } else {
      console.log('   ⚠️ Redis not configured (using memory stores)');
    }

    // Test 2: Basic cache operations
    console.log('\n2️⃣ Testing cache operations...');
    const testKey = 'test:key';
    const testData = { message: 'Hello Redis!', timestamp: Date.now() };

    // Set data
    const setResult = await redisService.set(testKey, testData, 60); // 1 minute TTL
    console.log(`   Set result: ${setResult ? '✅' : '❌'}`);

    // Get data
    const retrievedData = await redisService.get(testKey);
    console.log(`   Get result: ${retrievedData ? '✅' : '❌'}`);
    if (retrievedData) {
      console.log(`   Data matches: ${JSON.stringify(retrievedData) === JSON.stringify(testData) ? '✅' : '❌'}`);
    }

    // Test 3: Rate limiting simulation
    console.log('\n3️⃣ Testing rate limiting...');
    const rateLimitKey = 'test:ratelimit';
    const rateLimitResult = await redisService.checkRateLimit(rateLimitKey, 60000, 5); // 1 min, 5 requests
    console.log(`   Rate limit check: ${rateLimitResult.allowed ? '✅' : '❌'}`);
    console.log(`   Remaining requests: ${rateLimitResult.remaining}`);

    // Test 4: Session management simulation
    console.log('\n4️⃣ Testing session management...');
    const sessionId = 'test-session-123';
    const sessionData = { userId: 123, loginTime: new Date().toISOString() };

    const sessionSet = await redisService.setSession(sessionId, sessionData, 300); // 5 minutes
    console.log(`   Session set: ${sessionSet ? '✅' : '❌'}`);

    const retrievedSession = await redisService.getSession(sessionId);
    console.log(`   Session get: ${retrievedSession ? '✅' : '❌'}`);

    // Test 5: Health check
    console.log('\n5️⃣ Testing health check...');
    const healthResult = await redisService.healthCheck();
    console.log(`   Health status: ${healthResult.status}`);
    if (healthResult.status === 'healthy') {
      console.log('   ✅ Redis is healthy');
    } else if (healthResult.status === 'disconnected') {
      console.log('   ⚠️ Redis not connected (expected if not configured)');
    } else {
      console.log('   ❌ Redis health check failed');
    }

    // Test 6: Cleanup
    console.log('\n6️⃣ Cleaning up test data...');
    await redisService.del(testKey);
    await redisService.deleteSession(sessionId);
    await redisService.resetRateLimit(rateLimitKey);
    console.log('   ✅ Test data cleaned up');

    // Test 7: Statistics
    console.log('\n7️⃣ Redis statistics:');
    const stats = redisService.getStats();
    console.log(`   Connected: ${stats.connected}`);
    console.log(`   Operations: ${stats.operations}`);
    console.log(`   Hit rate: ${stats.hitRate}%`);
    console.log(`   Errors: ${stats.errors}`);

    console.log('\n🎉 Redis integration test completed!');

    // Disconnect if connected
    if (redisService.isConnected) {
      await redisService.disconnect();
      console.log('✅ Redis disconnected');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Run the test
testRedisIntegration().catch(console.error);
