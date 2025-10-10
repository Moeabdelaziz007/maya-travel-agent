/**
 * API Contract Validation Tests
 * Validates response schemas and required fields for key endpoints
 *
 * Tests:
 * - POST /api/orchestration/plan-trip contract compliance
 * - POST /api/orchestration/chat contract compliance
 * - GET /api/orchestration/health contract compliance
 * - GET /api/orchestration/skills contract compliance
 * - Response schema validation
 * - Required field validation
 * - Error response contract validation
 */

const axios = require('axios');
const Joi = require('joi');

// Test configuration
const config = {
  baseURL: process.env.TEST_URL || 'http://localhost:3001',
  apiKey: process.env.TEST_API_KEY || 'test-key',
  timeout: 30000
};

// Response schemas for contract validation
const schemas = {
  // Successful trip planning response schema
  tripPlanningSuccess: Joi.object({
    success: Joi.boolean().valid(true).required(),
    data: Joi.object({
      tripId: Joi.string().required(),
      destination: Joi.string().required(),
      itinerary: Joi.array().items(
        Joi.object({
          day: Joi.number().integer().positive().required(),
          activities: Joi.array().items(Joi.string()).required(),
          meals: Joi.array().items(Joi.string()).optional()
        })
      ).required(),
      estimatedCost: Joi.number().positive().required(),
      recommendations: Joi.array().items(Joi.string()).optional()
    }).required(),
    metadata: Joi.object({
      requestId: Joi.string().required(),
      responseTime: Joi.number().positive().required(),
      processingTime: Joi.number().positive().required(),
      enhanced: Joi.boolean().valid(true).required(),
      skills_enabled: Joi.boolean().valid(true).required(),
      agents: Joi.array().items(Joi.string()).optional(),
      skillsUsed: Joi.array().items(Joi.string()).optional()
    }).required()
  }).required(),

  // Error response schema
  errorResponse: Joi.object({
    success: Joi.boolean().valid(false).required(),
    error: Joi.string().required(),
    metadata: Joi.object({
      requestId: Joi.string().optional(),
      processingTime: Joi.number().positive().optional(),
      enhanced: Joi.boolean().valid(true).optional()
    }).optional()
  }).required(),

  // Health check response schema
  healthCheck: Joi.object({
    success: Joi.boolean().valid(true).required(),
    health: Joi.object({
      overall_status: Joi.string().valid('healthy', 'degraded', 'unhealthy').required(),
      boss_agent: Joi.object({
        status: Joi.string().valid('connected', 'disconnected', 'error').required(),
        response_time: Joi.number().positive().optional()
      }).required(),
      skill_system: Joi.object({
        status: Joi.string().valid('operational', 'degraded', 'failed').required(),
        skills_loaded: Joi.number().integer().min(0).required()
      }).required(),
      cache: Joi.object({
        status: Joi.string().valid('connected', 'disconnected', 'error').required()
      }).required()
    }).required(),
    timestamp: Joi.string().isoDate().required()
  }).required(),

  // Skills list response schema
  skillsList: Joi.object({
    success: Joi.boolean().valid(true).required(),
    skills: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        version: Joi.string().optional(),
        enabled: Joi.boolean().required(),
        capabilities: Joi.array().items(Joi.string()).required()
      })
    ).required(),
    count: Joi.number().integer().min(0).required(),
    timestamp: Joi.string().isoDate().required()
  }).required(),

  // Chat response schema
  chatResponse: Joi.object({
    success: Joi.boolean().valid(true).required(),
    reply: Joi.string().required(),
    conversationId: Joi.string().optional(),
    emotional_context: Joi.object({
      primary_emotion: Joi.string().required(),
      confidence: Joi.number().min(0).max(1).required(),
      suggested_tone: Joi.string().required()
    }).optional(),
    friendship_level: Joi.string().optional(),
    metadata: Joi.object({
      requestId: Joi.string().required(),
      responseTime: Joi.number().positive().required(),
      skillsUsed: Joi.array().items(Joi.string()).optional()
    }).required()
  }).required()
};

// Test utilities
class ContractValidator {
  constructor() {
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

  validateSchema(data, schema, schemaName) {
    const { error } = schema.validate(data, { allowUnknown: false });
    if (error) {
      throw new Error(`${schemaName} validation failed: ${error.details[0].message}`);
    }
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

  printResults() {
    console.log('\n📋 CONTRACT VALIDATION RESULTS');
    console.log('='.repeat(50));
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
      console.log('\n🎉 ALL CONTRACT TESTS PASSED! API contracts are valid.');
    } else {
      console.log('\n⚠️ SOME CONTRACT TESTS FAILED! API contracts need review.');
    }

    console.log('='.repeat(50));
  }
}

// Test suite
class ContractValidationTests {
  constructor() {
    this.validator = new ContractValidator();
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
  }

  async runAllTests() {
    console.log('🚀 Starting API Contract Validation Tests');
    console.log(`Target URL: ${this.baseURL}`);
    console.log('─'.repeat(60));

    try {
      // Test 1: POST /api/orchestration/plan-trip - Success contract
      await this.testTripPlanningSuccessContract();

      // Test 2: POST /api/orchestration/plan-trip - Error contract
      await this.testTripPlanningErrorContract();

      // Test 3: POST /api/orchestration/chat - Success contract
      await this.testChatSuccessContract();

      // Test 4: GET /api/orchestration/health - Contract validation
      await this.testHealthCheckContract();

      // Test 5: GET /api/orchestration/skills - Contract validation
      await this.testSkillsListContract();

      // Test 6: Required field validation
      await this.testRequiredFieldValidation();

      // Test 7: Response time validation
      await this.testResponseTimeValidation();

      this.validator.printResults();

    } catch (error) {
      console.error('❌ Contract validation suite failed:', error);
      this.validator.recordResult('contract_suite', false, error.message);
      this.validator.printResults();
    }
  }

  async testTripPlanningSuccessContract() {
    await this.validator.runTest('Trip Planning Success Contract', async () => {
      const response = await axios.post(
        `${this.baseURL}/api/orchestration/plan-trip`,
        {
          message: 'I want to plan a trip to Tokyo for 2 people',
          userId: 'contract-test-user',
          budget: 3000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          timeout: config.timeout
        }
      );

      // Validate response structure
      this.validator.validateSchema(response.data, schemas.tripPlanningSuccess, 'Trip Planning Success');

      // Additional validations
      if (response.data.metadata.processingTime > 30000) {
        throw new Error('Processing time exceeds 30 seconds');
      }

      if (!response.data.metadata.requestId) {
        throw new Error('Request ID is missing from metadata');
      }

      return {
        status: response.status,
        processingTime: response.data.metadata.processingTime,
        requestId: response.data.metadata.requestId
      };
    });
  }

  async testTripPlanningErrorContract() {
    await this.validator.runTest('Trip Planning Error Contract', async () => {
      try {
        await axios.post(
          `${this.baseURL}/api/orchestration/plan-trip`,
          {
            // Missing required message field
            userId: 'contract-test-user'
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`
            },
            timeout: config.timeout
          }
        );

        throw new Error('Should have returned validation error');
      } catch (error) {
        if (error.response) {
          // Validate error response structure
          this.validator.validateSchema(error.response.data, schemas.errorResponse, 'Trip Planning Error');

          if (error.response.status !== 400) {
            throw new Error(`Expected 400 status, got ${error.response.status}`);
          }

          return {
            status: error.response.status,
            error: error.response.data.error
          };
        }
        throw error;
      }
    });
  }

  async testChatSuccessContract() {
    await this.validator.runTest('Chat Success Contract', async () => {
      const response = await axios.post(
        `${this.baseURL}/api/orchestration/chat`,
        {
          message: 'مرحباً! ما هي أفضل وجهة سياحية في الصيف؟',
          userId: 'contract-chat-user',
          conversationId: 'contract-test-conv'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          timeout: config.timeout
        }
      );

      // Validate response structure
      this.validator.validateSchema(response.data, schemas.chatResponse, 'Chat Success');

      // Additional validations
      if (response.data.reply.length === 0) {
        throw new Error('Chat reply is empty');
      }

      if (!response.data.metadata.requestId) {
        throw new Error('Request ID is missing from chat metadata');
      }

      return {
        status: response.status,
        replyLength: response.data.reply.length,
        hasEmotionalContext: !!response.data.emotional_context,
        friendshipLevel: response.data.friendship_level
      };
    });
  }

  async testHealthCheckContract() {
    await this.validator.runTest('Health Check Contract', async () => {
      const response = await axios.get(
        `${this.baseURL}/api/orchestration/health`,
        { timeout: config.timeout }
      );

      // Validate response structure
      this.validator.validateSchema(response.data, schemas.healthCheck, 'Health Check');

      // Additional validations
      if (response.data.health.overall_status === 'unhealthy') {
        throw new Error('System health is unhealthy');
      }

      if (response.data.health.skill_system.skills_loaded === 0) {
        throw new Error('No skills are loaded');
      }

      return {
        status: response.status,
        overallStatus: response.data.health.overall_status,
        skillsLoaded: response.data.health.skill_system.skills_loaded
      };
    });
  }

  async testSkillsListContract() {
    await this.validator.runTest('Skills List Contract', async () => {
      const response = await axios.get(
        `${this.baseURL}/api/orchestration/skills`,
        { timeout: config.timeout }
      );

      // Validate response structure
      this.validator.validateSchema(response.data, schemas.skillsList, 'Skills List');

      // Additional validations
      if (response.data.count === 0) {
        throw new Error('No skills are registered');
      }

      // Check that each skill has required fields
      response.data.skills.forEach(skill => {
        if (!skill.name || !skill.description || !skill.capabilities) {
          throw new Error(`Skill missing required fields: ${JSON.stringify(skill)}`);
        }
      });

      return {
        status: response.status,
        skillsCount: response.data.count,
        skills: response.data.skills.map(s => s.name)
      };
    });
  }

  async testRequiredFieldValidation() {
    await this.validator.runTest('Required Field Validation', async () => {
      const requiredFieldTests = [
        {
          name: 'Missing message field',
          payload: { userId: 'test-user' },
          expectedError: 'Message is required'
        },
        {
          name: 'Empty message field',
          payload: { message: '', userId: 'test-user' },
          expectedError: 'Message is required'
        },
        {
          name: 'Message too long',
          payload: {
            message: 'x'.repeat(2001),
            userId: 'test-user'
          },
          expectedError: 'Message is too long'
        }
      ];

      for (const test of requiredFieldTests) {
        try {
          await axios.post(
            `${this.baseURL}/api/orchestration/plan-trip`,
            test.payload,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`
              },
              timeout: config.timeout
            }
          );

          throw new Error(`${test.name}: Should have returned validation error`);
        } catch (error) {
          if (error.response && error.response.status === 400) {
            if (!error.response.data.error.includes(test.expectedError)) {
              throw new Error(`${test.name}: Expected error message not found`);
            }
          } else {
            throw new Error(`${test.name}: Expected 400 status`);
          }
        }
      }

      return {
        testsRun: requiredFieldTests.length,
        allPassed: true
      };
    });
  }

  async testResponseTimeValidation() {
    await this.validator.runTest('Response Time Validation', async () => {
      const startTime = Date.now();

      const response = await axios.post(
        `${this.baseURL}/api/orchestration/plan-trip`,
        {
          message: 'Quick test for response time',
          userId: 'perf-test-user',
          budget: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          timeout: config.timeout
        }
      );

      const totalTime = Date.now() - startTime;
      const processingTime = response.data.metadata.processingTime;

      // Validate response times
      if (totalTime > 10000) { // 10 seconds
        throw new Error(`Total response time too slow: ${totalTime}ms`);
      }

      if (processingTime > 8000) { // 8 seconds
        throw new Error(`Processing time too slow: ${processingTime}ms`);
      }

      return {
        totalTime,
        processingTime,
        withinLimits: true
      };
    });
  }
}

// Export for use in test runner
module.exports = ContractValidationTests;

// Run tests if called directly
if (require.main === module) {
  const tests = new ContractValidationTests();
  tests.runAllTests().then(() => {
    process.exit(tests.validator.testResults.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Fatal error in contract validation:', error);
    process.exit(1);
  });
}