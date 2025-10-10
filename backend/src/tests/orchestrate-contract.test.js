/**
 * API Contract Validation for POST /api/orchestrate
 * Validates the orchestration endpoint contract compliance
 */

const { ApiTestClient, ResponseValidator, TestDataFactory } = require('./test-utils');
const { MockDataFactory } = require('./mock-data');

class OrchestrateContractValidator {
  constructor() {
    this.client = new ApiTestClient();
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  recordResult(testName, passed, message, details = null) {
    this.testResults.total++;
    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }

    this.testResults.details.push({
      test: testName,
      passed,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async runTest(testName, testFn) {
    try {
      const result = await testFn();
      this.recordResult(testName, true, 'Test passed', result);
      return result;
    } catch (error) {
      this.recordResult(testName, false, error.message);
      throw error;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting POST /api/orchestrate Contract Validation');
    console.log('─'.repeat(60));

    try {
      // Test 1: Successful trip planning orchestration
      await this.testSuccessfulTripPlanning();

      // Test 2: Successful chat orchestration
      await this.testSuccessfulChatOrchestration();

      // Test 3: Error handling - invalid input
      await this.testInvalidInputHandling();

      // Test 4: Error handling - missing required fields
      await this.testMissingRequiredFields();

      // Test 5: Error handling - malformed request
      await this.testMalformedRequest();

      // Test 6: Performance validation
      await this.testPerformanceValidation();

      // Test 7: Response metadata validation
      await this.testResponseMetadata();

      // Test 8: Skills integration validation
      await this.testSkillsIntegration();

      // Test 9: Boss Agent orchestration flow
      await this.testBossAgentOrchestration();

      this.printResults();

    } catch (error) {
      console.error('❌ Contract validation suite failed:', error);
      this.recordResult('contract_suite', false, error.message);
      this.printResults();
    }
  }

  async testSuccessfulTripPlanning() {
    await this.runTest('Successful Trip Planning Orchestration', async () => {
      const tripRequest = TestDataFactory.createTripRequest({
        message: 'أريد رحلة إلى دبي لشخصين',
        destination: 'Dubai',
        travelers: 2,
        budget: 3000
      });

      const response = await this.client.planTrip(tripRequest);

      // Validate response structure
      ResponseValidator.validateTripPlanningResponse(response);

      // Additional validations
      if (!response.data.data.tripId) {
        throw new Error('Trip ID is missing from response');
      }

      if (!response.data.data.itinerary || response.data.data.itinerary.length === 0) {
        throw new Error('Itinerary is missing or empty');
      }

      if (!response.data.metadata.agents || response.data.metadata.agents.length === 0) {
        throw new Error('Agent information is missing');
      }

      return {
        tripId: response.data.data.tripId,
        agentsUsed: response.data.metadata.agents,
        skillsUsed: response.data.metadata.skillsUsed || [],
        processingTime: response.data.metadata.processingTime
      };
    });
  }

  async testSuccessfulChatOrchestration() {
    await this.runTest('Successful Chat Orchestration', async () => {
      const chatRequest = TestDataFactory.createChatMessage({
        message: 'مرحباً مايا! أريد نصائح للسفر إلى اسطنبول',
        userId: 'test-user-chat',
        conversationId: 'test-conv-chat'
      });

      const response = await this.client.sendChatMessage(chatRequest);

      // Validate response structure
      ResponseValidator.validateChatResponse(response);

      // Additional validations
      if (!response.data.reply || response.data.reply.length === 0) {
        throw new Error('Chat reply is empty');
      }

      if (!response.data.emotional_context) {
        throw new Error('Emotional context is missing');
      }

      if (!response.data.friendship_level) {
        throw new Error('Friendship level is missing');
      }

      return {
        replyLength: response.data.reply.length,
        primaryEmotion: response.data.emotional_context.primary_emotion,
        friendshipLevel: response.data.friendship_level,
        skillsUsed: response.data.metadata.skillsUsed || []
      };
    });
  }

  async testInvalidInputHandling() {
    await this.runTest('Invalid Input Handling', async () => {
      const invalidRequest = {
        message: '', // Empty message
        userId: 'test-user'
      };

      try {
        await this.client.planTrip(invalidRequest);
        throw new Error('Should have returned validation error');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          ResponseValidator.validateErrorResponse(error.response, 400);
          return {
            status: error.response.status,
            error: error.response.data.error
          };
        }
        throw new Error('Expected 400 status for invalid input');
      }
    });
  }

  async testMissingRequiredFields() {
    await this.runTest('Missing Required Fields', async () => {
      const incompleteRequest = {
        // Missing message field
        userId: 'test-user'
      };

      try {
        await this.client.planTrip(incompleteRequest);
        throw new Error('Should have returned validation error');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          ResponseValidator.validateErrorResponse(error.response, 400);
          return {
            status: error.response.status,
            error: error.response.data.error
          };
        }
        throw new Error('Expected 400 status for missing required fields');
      }
    });
  }

  async testMalformedRequest() {
    await this.runTest('Malformed Request Handling', async () => {
      const malformedRequest = {
        message: 'Valid message',
        userId: 'test-user',
        invalidField: 'should be ignored',
        nestedObject: {
          deeply: {
            nested: 'value'
          }
        }
      };

      const response = await this.client.planTrip(malformedRequest);

      // Should still process successfully despite extra fields
      ResponseValidator.validateTripPlanningResponse(response);

      return {
        status: response.status,
        processedSuccessfully: true
      };
    });
  }

  async testPerformanceValidation() {
    await this.runTest('Performance Validation', async () => {
      const startTime = Date.now();

      const tripRequest = TestDataFactory.createTripRequest({
        message: 'Quick performance test request',
        destination: 'Tokyo',
        travelers: 1,
        budget: 1000
      });

      const response = await this.client.planTrip(tripRequest);
      const totalTime = Date.now() - startTime;

      // Validate response time
      if (totalTime > 10000) { // 10 seconds max
        throw new Error(`Response time too slow: ${totalTime}ms`);
      }

      if (response.data.metadata.processingTime > 8000) { // 8 seconds max processing
        throw new Error(`Processing time too slow: ${response.data.metadata.processingTime}ms`);
      }

      ResponseValidator.validateTripPlanningResponse(response);

      return {
        totalTime,
        processingTime: response.data.metadata.processingTime,
        withinLimits: true
      };
    });
  }

  async testResponseMetadata() {
    await this.runTest('Response Metadata Validation', async () => {
      const tripRequest = TestDataFactory.createTripRequest();

      const response = await this.client.planTrip(tripRequest);

      const metadata = response.data.metadata;

      // Validate required metadata fields
      if (!metadata.requestId) {
        throw new Error('Request ID is missing from metadata');
      }

      if (!metadata.responseTime || metadata.responseTime <= 0) {
        throw new Error('Response time is missing or invalid');
      }

      if (!metadata.processingTime || metadata.processingTime <= 0) {
        throw new Error('Processing time is missing or invalid');
      }

      if (typeof metadata.enhanced !== 'boolean') {
        throw new Error('Enhanced flag is missing or not boolean');
      }

      if (typeof metadata.skills_enabled !== 'boolean') {
        throw new Error('Skills enabled flag is missing or not boolean');
      }

      return {
        requestId: metadata.requestId,
        responseTime: metadata.responseTime,
        processingTime: metadata.processingTime,
        enhanced: metadata.enhanced,
        skillsEnabled: metadata.skills_enabled
      };
    });
  }

  async testSkillsIntegration() {
    await this.runTest('Skills Integration Validation', async () => {
      const chatRequest = TestDataFactory.createChatMessage({
        message: 'أشعر بالقلق من السفر لوحدي',
        userId: 'test-user-skills'
      });

      const response = await this.client.sendChatMessage(chatRequest);

      ResponseValidator.validateChatResponse(response);

      // Validate skills were used
      const skillsUsed = response.data.metadata.skillsUsed || [];
      if (skillsUsed.length === 0) {
        throw new Error('No skills were used in the response');
      }

      // Should include empathy detection for anxious message
      if (!skillsUsed.includes('EmpathyDetection')) {
        throw new Error('EmpathyDetection skill should have been used');
      }

      return {
        skillsUsed,
        emotionalContext: response.data.emotional_context,
        friendshipLevel: response.data.friendship_level
      };
    });
  }

  async testBossAgentOrchestration() {
    await this.runTest('Boss Agent Orchestration Flow', async () => {
      const complexRequest = TestDataFactory.createTripRequest({
        message: 'أريد رحلة شاملة إلى طوكيو تشمل الطيران والفندق والأنشطة',
        destination: 'Tokyo',
        travelers: 2,
        budget: 5000
      });

      const response = await this.client.planTrip(complexRequest);

      ResponseValidator.validateTripPlanningResponse(response);

      const metadata = response.data.metadata;

      // Validate multiple agents were used
      if (!metadata.agents || metadata.agents.length < 2) {
        throw new Error('Multiple agents should have been used for complex request');
      }

      // Validate skills were applied
      if (!metadata.skillsUsed || metadata.skillsUsed.length === 0) {
        throw new Error('Skills should have been used in orchestration');
      }

      // Validate itinerary complexity
      const itinerary = response.data.data.itinerary;
      if (!itinerary || itinerary.length < 2) {
        throw new Error('Complex request should generate detailed itinerary');
      }

      return {
        agentsUsed: metadata.agents,
        skillsUsed: metadata.skillsUsed,
        itineraryDays: itinerary.length,
        recommendationsCount: response.data.data.recommendations?.length || 0
      };
    });
  }

  printResults() {
    console.log('\n📋 POST /api/orchestrate CONTRACT VALIDATION RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📊 Total: ${this.testResults.total}`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(2)}%`);

    console.log('\n📋 DETAILED RESULTS:');
    this.testResults.details.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} Test ${index + 1}: ${result.test}`);
      console.log(`   ${result.message}`);
      if (result.details) {
        console.log('   Details:', result.details);
      }
    });

    if (this.testResults.failed === 0) {
      console.log('\n🎉 ALL CONTRACT TESTS PASSED! POST /api/orchestrate is compliant.');
    } else {
      console.log('\n⚠️ SOME CONTRACT TESTS FAILED! Review and fix API contract issues.');
    }

    console.log('='.repeat(60));
  }
}

// Export for use in test runner
module.exports = OrchestrateContractValidator;

// Run tests if called directly
if (require.main === module) {
  const validator = new OrchestrateContractValidator();
  validator.runAllTests().then(() => {
    process.exit(validator.testResults.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Fatal error in orchestration contract validation:', error);
    process.exit(1);
  });
}