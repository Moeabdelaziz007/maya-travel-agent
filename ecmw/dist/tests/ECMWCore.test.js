"use strict";
/**
 * E-CMW Core System Tests
 * Comprehensive testing for the Enhanced Cognitive Mesh Weaver core components
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ECMWCore_1 = require("../core/ECMWCore");
describe('ECMWCore', () => {
    let ecmw;
    let config;
    beforeEach(() => {
        config = {
            enableEmotionalIntelligence: true,
            enableShadowPlanning: true,
            enableCrossTripMemory: true,
            enableSocialNetwork: true,
            enableCarbonTracking: true,
            enablePlanB: true,
            maxConcurrentWorkflows: 10,
            learningRate: 0.1,
            memoryRetentionDays: 30
        };
        ecmw = new ECMWCore_1.ECMWCore(config);
    });
    afterEach(async () => {
        await ecmw.shutdown();
    });
    describe('Initialization', () => {
        it('should initialize with all features enabled', () => {
            expect(ecmw).toBeDefined();
            // Test that all agents are initialized when enabled
        });
        it('should initialize with minimal features when disabled', () => {
            const minimalConfig = {
                enableEmotionalIntelligence: false,
                enableShadowPlanning: false,
                enableCrossTripMemory: false,
                enableSocialNetwork: false,
                enableCarbonTracking: false,
                enablePlanB: false,
                maxConcurrentWorkflows: 5,
                learningRate: 0.05,
                memoryRetentionDays: 15
            };
            const minimalECMW = new ECMWCore_1.ECMWCore(minimalConfig);
            expect(minimalECMW).toBeDefined();
        });
    });
    describe('Request Processing', () => {
        it('should process a simple travel planning request', async () => {
            const userContext = {
                userId: 'test_user_1',
                preferences: {
                    budget: 'medium',
                    travel_style: 'cultural'
                },
                travelHistory: []
            };
            const result = await ecmw.processRequest('test_user_1', 'I want to plan a trip to Japan', userContext);
            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.workflowId).toBeDefined();
            expect(result.output).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
        });
        it('should handle emotional context in requests', async () => {
            const userContext = {
                userId: 'test_user_2',
                emotionalState: 'excited',
                preferences: {
                    trip_type: 'adventure'
                }
            };
            const result = await ecmw.processRequest('test_user_2', 'I am so excited about my upcoming adventure trip!', userContext);
            expect(result).toBeDefined();
            expect(result.emotionalImpact).toBeDefined();
        });
        it('should generate backup plans when PlanB is enabled', async () => {
            const userContext = {
                userId: 'test_user_3',
                preferences: {
                    flexibility: 'high'
                }
            };
            const result = await ecmw.processRequest('test_user_3', 'Book a flight to New York for next week', userContext);
            expect(result.backupPlans).toBeDefined();
            expect(Array.isArray(result.backupPlans)).toBe(true);
        });
    });
    describe('User Context Management', () => {
        it('should create new user context for unknown users', async () => {
            const userContext = {
                userId: 'new_user',
                preferences: {
                    language: 'en'
                }
            };
            const result = await ecmw.processRequest('new_user', 'Hello, I need travel help', userContext);
            expect(result).toBeDefined();
            // Context should be created and stored
        });
        it('should update existing user context', async () => {
            const userContext = {
                userId: 'existing_user',
                preferences: {
                    destination: 'Europe'
                }
            };
            // First request to create context
            await ecmw.processRequest('existing_user', 'I want to go to Europe', userContext);
            // Second request to update context
            const result = await ecmw.processRequest('existing_user', 'Book hotels in Paris', { ...userContext, preferences: { ...userContext.preferences, city: 'Paris' } });
            expect(result).toBeDefined();
        });
    });
    describe('Performance Monitoring', () => {
        it('should track execution metrics', async () => {
            const userContext = {
                userId: 'metrics_user',
                preferences: {}
            };
            await ecmw.processRequest('metrics_user', 'Test performance tracking', userContext);
            const metrics = await ecmw.getHealthMetrics();
            expect(metrics).toBeDefined();
            expect(metrics.totalUsers).toBeGreaterThan(0);
        });
        it('should handle concurrent requests efficiently', async () => {
            const requests = Array.from({ length: 5 }, (_, i) => ecmw.processRequest(`concurrent_user_${i}`, `Concurrent request ${i}`, {
                userId: `concurrent_user_${i}`,
                preferences: { test: i }
            }));
            const results = await Promise.all(requests);
            expect(results).toHaveLength(5);
            results.forEach(result => {
                expect(result.success).toBe(true);
            });
        });
    });
    describe('Error Handling', () => {
        it('should handle invalid user input gracefully', async () => {
            try {
                await ecmw.processRequest('', ''); // Empty inputs
            }
            catch (error) {
                expect(error).toBeDefined();
                expect(error.message).toContain('Failed to process request');
            }
        });
        it('should handle missing context gracefully', async () => {
            const result = await ecmw.processRequest('no_context_user', 'Simple request without context');
            expect(result).toBeDefined();
            expect(result.success).toBe(true);
        });
    });
    describe('Cost Calculation', () => {
        it('should calculate costs accurately', async () => {
            const userContext = {
                userId: 'cost_user',
                preferences: {}
            };
            const result = await ecmw.processRequest('cost_user', 'Test cost calculation', userContext);
            expect(result.cost).toBeGreaterThanOrEqual(0);
            expect(typeof result.cost).toBe('number');
        });
        it('should track cumulative costs', async () => {
            const userContext = {
                userId: 'cost_tracking_user',
                preferences: {}
            };
            // Multiple requests
            await ecmw.processRequest('cost_tracking_user', 'Request 1', userContext);
            await ecmw.processRequest('cost_tracking_user', 'Request 2', userContext);
            const metrics = await ecmw.getHealthMetrics();
            expect(metrics.totalCost).toBeGreaterThanOrEqual(0);
        });
    });
    describe('System Health', () => {
        it('should provide health metrics', async () => {
            const metrics = await ecmw.getHealthMetrics();
            expect(metrics).toBeDefined();
            expect(metrics.activeWorkflows).toBeDefined();
            expect(metrics.totalUsers).toBeDefined();
            expect(metrics.averageExecutionTime).toBeDefined();
            expect(metrics.totalCost).toBeDefined();
            expect(metrics.optimizationScore).toBeDefined();
        });
        it('should handle graceful shutdown', async () => {
            await expect(ecmw.shutdown()).resolves.toBeUndefined();
        });
    });
});
describe('Integration Tests', () => {
    let ecmw;
    beforeAll(() => {
        const config = {
            enableEmotionalIntelligence: true,
            enableShadowPlanning: true,
            enableCrossTripMemory: true,
            enableSocialNetwork: true,
            enableCarbonTracking: true,
            enablePlanB: true,
            maxConcurrentWorkflows: 10,
            learningRate: 0.1,
            memoryRetentionDays: 30
        };
        ecmw = new ECMWCore_1.ECMWCore(config);
    });
    afterAll(async () => {
        await ecmw.shutdown();
    });
    it('should handle complex multi-intent travel request', async () => {
        const userContext = {
            userId: 'complex_user',
            preferences: {
                budget: 'luxury',
                travel_style: 'cultural',
                dietary_restrictions: 'halal'
            },
            emotionalState: 'excited',
            travelHistory: [
                {
                    tripId: 'previous_trip_1',
                    destination: 'Turkey',
                    companions: ['family'],
                    satisfaction: 9,
                    completedAt: new Date('2024-01-15')
                }
            ]
        };
        const result = await ecmw.processRequest('complex_user', 'I want to plan a luxury cultural trip to Morocco with my family, focusing on halal dining and historical sites', userContext);
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.emotionalImpact).toBeDefined();
        expect(result.carbonSaved).toBeDefined();
        expect(result.backupPlans).toBeDefined();
    });
    it('should learn from repeated interactions', async () => {
        const userId = 'learning_user';
        const baseContext = {
            userId,
            preferences: {
                destination: 'Asia'
            }
        };
        // Multiple similar requests
        const requests = [
            'I want to visit Japan',
            'Tell me about Tokyo hotels',
            'Book a trip to Kyoto',
            'What are the best restaurants in Osaka'
        ];
        const results = await Promise.all(requests.map(request => ecmw.processRequest(userId, request, baseContext)));
        expect(results).toHaveLength(4);
        results.forEach(result => {
            expect(result.success).toBe(true);
        });
        // System should learn and improve
        const metrics = await ecmw.getHealthMetrics();
        expect(metrics.optimizationScore).toBeGreaterThan(0);
    });
});
describe('Performance Tests', () => {
    let ecmw;
    beforeAll(() => {
        const config = {
            enableEmotionalIntelligence: false, // Disable for performance testing
            enableShadowPlanning: false,
            enableCrossTripMemory: false,
            enableSocialNetwork: false,
            enableCarbonTracking: false,
            enablePlanB: false,
            maxConcurrentWorkflows: 50,
            learningRate: 0.1,
            memoryRetentionDays: 30
        };
        ecmw = new ECMWCore_1.ECMWCore(config);
    });
    afterAll(async () => {
        await ecmw.shutdown();
    });
    it('should handle high load efficiently', async () => {
        const startTime = Date.now();
        const requestCount = 20;
        const requests = Array.from({ length: requestCount }, (_, i) => ecmw.processRequest(`load_user_${i}`, `Load test request ${i}`, {
            userId: `load_user_${i}`,
            preferences: { test: i }
        }));
        const results = await Promise.all(requests);
        const endTime = Date.now();
        expect(results).toHaveLength(requestCount);
        results.forEach(result => {
            expect(result.success).toBe(true);
        });
        const totalTime = endTime - startTime;
        const averageTime = totalTime / requestCount;
        // Should process requests efficiently
        expect(averageTime).toBeLessThan(5000); // Less than 5 seconds average
    });
    it('should maintain performance under concurrent load', async () => {
        const concurrentRequests = 10;
        const requestsPerUser = 5;
        const startTime = Date.now();
        // Create concurrent users with multiple requests each
        const allRequests = Array.from({ length: concurrentRequests }, (_, userIndex) => Array.from({ length: requestsPerUser }, (_, requestIndex) => ecmw.processRequest(`concurrent_load_user_${userIndex}`, `Concurrent load request ${requestIndex}`, {
            userId: `concurrent_load_user_${userIndex}`,
            preferences: { userIndex, requestIndex }
        }))).flat();
        const results = await Promise.all(allRequests);
        const endTime = Date.now();
        expect(results).toHaveLength(concurrentRequests * requestsPerUser);
        results.forEach(result => {
            expect(result.success).toBe(true);
        });
        const totalTime = endTime - startTime;
        const requestsPerSecond = (concurrentRequests * requestsPerUser) / (totalTime / 1000);
        // Should maintain reasonable throughput
        expect(requestsPerSecond).toBeGreaterThan(0.5); // At least 0.5 requests per second
    });
});
describe('Error Recovery Tests', () => {
    let ecmw;
    beforeAll(() => {
        const config = {
            enableEmotionalIntelligence: true,
            enableShadowPlanning: true,
            enableCrossTripMemory: true,
            enableSocialNetwork: true,
            enableCarbonTracking: true,
            enablePlanB: true,
            maxConcurrentWorkflows: 10,
            learningRate: 0.1,
            memoryRetentionDays: 30
        };
        ecmw = new ECMWCore_1.ECMWCore(config);
    });
    afterAll(async () => {
        await ecmw.shutdown();
    });
    it('should recover from partial failures', async () => {
        // This test would simulate partial failures and verify recovery
        // For now, we'll test with a request that might trigger fallbacks
        const userContext = {
            userId: 'recovery_user',
            preferences: {
                // Intentionally complex preferences that might cause issues
                complex_requirement: 'very_specific_needs'
            }
        };
        const result = await ecmw.processRequest('recovery_user', 'Complex travel request that might need fallback handling', userContext);
        expect(result).toBeDefined();
        // Should either succeed or provide meaningful error information
        expect(result.success || result.output?.error).toBeDefined();
    });
    it('should handle resource exhaustion gracefully', async () => {
        // Simulate resource exhaustion scenario
        const manyRequests = Array.from({ length: 15 }, (_, i) => ecmw.processRequest(`exhaustion_user_${i}`, `Resource exhaustion test ${i}`, {
            userId: `exhaustion_user_${i}`,
            preferences: { load: 'high' }
        }));
        const results = await Promise.allSettled(manyRequests);
        // Should handle all requests, even if some fail
        expect(results.length).toBe(15);
        const successful = results.filter(r => r.status === 'fulfilled');
        const failed = results.filter(r => r.status === 'rejected');
        // Should have reasonable success rate
        const successRate = successful.length / results.length;
        expect(successRate).toBeGreaterThan(0.7); // At least 70% success rate
    });
});
//# sourceMappingURL=ECMWCore.test.js.map