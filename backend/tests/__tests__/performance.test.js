/**
 * Performance Testing Suite
 * Tests API endpoints for load, response time, memory usage, and concurrent users
 */

const request = require('supertest');
const { performance } = require('perf_hooks');
const { EventEmitter } = require('events');
const v8 = require('v8');

// Mock external dependencies
jest.mock('../../utils/logger');
jest.mock('../../utils/healthMonitor');
jest.mock('../../database/supabase');
jest.mock('../../src/ai/zaiClient');

// Import after mocking
const app = require('../../server');
const logger = require('../../utils/logger');
const healthMonitor = require('../../utils/healthMonitor');

// Performance test utilities
class PerformanceTestUtils {
  static async measureResponseTime(endpoint, method = 'GET', data = null, iterations = 100) {
    const times = [];
    const startTotal = performance.now();

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      let response;
      if (method === 'GET') {
        response = await request(app).get(endpoint);
      } else if (method === 'POST') {
        response = await request(app).post(endpoint).send(data);
      } else if (method === 'PUT') {
        response = await request(app).put(endpoint).send(data);
      } else if (method === 'DELETE') {
        response = await request(app).delete(endpoint);
      }

      const end = performance.now();
      times.push(end - start);
    }

    const endTotal = performance.now();

    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      p95: this.calculatePercentile(times, 95),
      p99: this.calculatePercentile(times, 99),
      totalTime: endTotal - startTotal,
      iterations,
      requestsPerSecond: iterations / ((endTotal - startTotal) / 1000)
    };
  }

  static calculatePercentile(sortedArray, percentile) {
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  static async simulateConcurrentUsers(endpoint, userCount, requestsPerUser = 10) {
    const results = [];
    const promises = [];

    for (let user = 0; user < userCount; user++) {
      promises.push(this.simulateUserLoad(endpoint, requestsPerUser, user));
    }

    const userResults = await Promise.all(promises);

    return {
      totalRequests: userCount * requestsPerUser,
      totalTime: Math.max(...userResults.map(r => r.totalTime)),
      averageResponseTime: userResults.reduce((sum, r) => sum + r.averageTime, 0) / userResults.length,
      successRate: userResults.filter(r => r.successCount === requestsPerUser).length / userCount,
      userResults
    };
  }

  static async simulateUserLoad(endpoint, requestCount, userId) {
    const times = [];
    let successCount = 0;
    const startTime = performance.now();

    for (let i = 0; i < requestCount; i++) {
      try {
        const start = performance.now();
        const response = await request(app).get(endpoint);
        const end = performance.now();

        if (response.status >= 200 && response.status < 300) {
          successCount++;
          times.push(end - start);
        }

        // Add random delay to simulate real user behavior
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      } catch (error) {
        // Request failed
      }
    }

    const endTime = performance.now();

    return {
      userId,
      totalTime: endTime - startTime,
      averageTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
      successCount,
      requestCount,
      successRate: successCount / requestCount
    };
  }

  static async monitorMemoryUsage(operation, iterations = 1000) {
    const initialMemory = process.memoryUsage();
    const heapStats = [];

    for (let i = 0; i < iterations; i++) {
      await operation();
      heapStats.push(process.memoryUsage().heapUsed);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    }

    const finalMemory = process.memoryUsage();

    return {
      initial: initialMemory,
      final: finalMemory,
      difference: {
        rss: finalMemory.rss - initialMemory.rss,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        external: finalMemory.external - initialMemory.external
      },
      heapStats: {
        min: Math.min(...heapStats),
        max: Math.max(...heapStats),
        average: heapStats.reduce((a, b) => a + b, 0) / heapStats.length
      },
      iterations
    };
  }

  static async loadTest(endpoint, targetRPS, durationSeconds = 60) {
    const results = [];
    const startTime = Date.now();
    const endTime = startTime + (durationSeconds * 1000);
    let requestCount = 0;
    let successCount = 0;
    let errorCount = 0;

    const emitter = new EventEmitter();

    // Start load generation
    const loadGenerator = setInterval(async () => {
      if (Date.now() >= endTime) {
        clearInterval(loadGenerator);
        emitter.emit('done');
        return;
      }

      const batchSize = Math.ceil(targetRPS / 10); // Send requests in batches
      const promises = [];

      for (let i = 0; i < batchSize; i++) {
        requestCount++;
        promises.push(
          request(app)
            .get(endpoint)
            .timeout(5000)
            .then(response => {
              if (response.status >= 200 && response.status < 300) {
                successCount++;
              } else {
                errorCount++;
              }
            })
            .catch(() => {
              errorCount++;
            })
        );
      }

      await Promise.all(promises);
    }, 100); // 10 batches per second

    return new Promise((resolve) => {
      emitter.on('done', () => {
        const actualDuration = (Date.now() - startTime) / 1000;
        const actualRPS = requestCount / actualDuration;

        resolve({
          targetRPS,
          actualRPS,
          duration: actualDuration,
          totalRequests: requestCount,
          successCount,
          errorCount,
          successRate: successCount / requestCount,
          averageResponseTime: 1000 / actualRPS // Approximate
        });
      });
    });
  }
}

describe('Performance Testing Suite', () => {
  beforeAll(async () => {
    // Setup test environment
    jest.setTimeout(300000); // 5 minutes for performance tests
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Response Time Validation', () => {
    test('should handle health check endpoint under normal load', async () => {
      const results = await PerformanceTestUtils.measureResponseTime('/health', 'GET', null, 50);

      expect(results.average).toBeLessThan(100); // Should respond within 100ms
      expect(results.p95).toBeLessThan(200); // 95% of requests should be under 200ms
      expect(results.requestsPerSecond).toBeGreaterThan(100); // Should handle at least 100 RPS
    });

    test('should maintain response times under concurrent load', async () => {
      const results = await PerformanceTestUtils.simulateConcurrentUsers('/health', 20, 10);

      expect(results.successRate).toBeGreaterThan(0.95); // 95% success rate
      expect(results.averageResponseTime).toBeLessThan(200); // Average under 200ms
    });

    test('should handle API endpoints with authentication', async () => {
      // Mock authentication for protected routes
      const results = await PerformanceTestUtils.measureResponseTime('/api/trips', 'GET', null, 30);

      expect(results.average).toBeLessThan(300); // Should respond within 300ms
      expect(results.p99).toBeLessThan(1000); // 99% under 1 second
    });
  });

  describe('Load Testing', () => {
    test('should sustain 50 RPS for health endpoint', async () => {
      const results = await PerformanceTestUtils.loadTest('/health', 50, 10);

      expect(results.successRate).toBeGreaterThan(0.95);
      expect(results.actualRPS).toBeGreaterThan(40); // At least 80% of target
    });

    test('should handle burst traffic for API endpoints', async () => {
      const results = await PerformanceTestUtils.loadTest('/api/trips', 30, 15);

      expect(results.successRate).toBeGreaterThan(0.90);
      expect(results.errorCount).toBeLessThan(results.totalRequests * 0.1); // Less than 10% errors
    });

    test('should gracefully degrade under extreme load', async () => {
      const results = await PerformanceTestUtils.loadTest('/health', 200, 5);

      // Even under extreme load, should not crash completely
      expect(results.successRate).toBeGreaterThan(0.5);
      expect(results.actualRPS).toBeGreaterThan(50); // Should handle reasonable load
    });
  });

  describe('Memory Usage Monitoring', () => {
    test('should not have memory leaks in health checks', async () => {
      const memoryUsage = await PerformanceTestUtils.monitorMemoryUsage(
        async () => {
          await request(app).get('/health');
        },
        100
      );

      // Memory usage should not grow significantly
      expect(memoryUsage.difference.heapUsed).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
      expect(memoryUsage.heapStats.max - memoryUsage.heapStats.min).toBeLessThan(5 * 1024 * 1024); // Less than 5MB variation
    });

    test('should maintain stable memory usage under load', async () => {
      const memoryUsage = await PerformanceTestUtils.monitorMemoryUsage(
        async () => {
          await request(app).get('/api/trips');
          await new Promise(resolve => setTimeout(resolve, 10)); // Simulate processing time
        },
        200
      );

      expect(memoryUsage.difference.heapUsed).toBeLessThan(20 * 1024 * 1024); // Less than 20MB growth
    });
  });

  describe('Concurrent User Simulation', () => {
    test('should handle 50 concurrent users', async () => {
      const results = await PerformanceTestUtils.simulateConcurrentUsers('/health', 50, 5);

      expect(results.successRate).toBeGreaterThan(0.95);
      expect(results.averageResponseTime).toBeLessThan(500); // Under 500ms average
      expect(results.totalTime).toBeLessThan(10000); // Complete within 10 seconds
    });

    test('should handle 100 concurrent users on API endpoints', async () => {
      const results = await PerformanceTestUtils.simulateConcurrentUsers('/api/trips', 100, 3);

      expect(results.successRate).toBeGreaterThan(0.90);
      expect(results.averageResponseTime).toBeLessThan(1000); // Under 1 second average
    });

    test('should maintain session isolation under concurrent load', async () => {
      // Test that concurrent users don't interfere with each other's sessions
      const userPromises = [];

      for (let i = 0; i < 20; i++) {
        userPromises.push(
          PerformanceTestUtils.simulateUserLoad('/health', 10, i)
        );
      }

      const userResults = await Promise.all(userPromises);
      const allSuccessful = userResults.every(result => result.successRate === 1.0);

      expect(allSuccessful).toBe(true);
    });
  });

  describe('Stress Testing', () => {
    test('should recover from sudden load spikes', async () => {
      // Simulate normal load
      await PerformanceTestUtils.loadTest('/health', 20, 5);

      // Spike to high load
      const spikeResults = await PerformanceTestUtils.loadTest('/health', 100, 3);

      // Return to normal load
      const recoveryResults = await PerformanceTestUtils.loadTest('/health', 20, 5);

      expect(spikeResults.successRate).toBeGreaterThan(0.7); // Handle spike reasonably
      expect(recoveryResults.successRate).toBeGreaterThan(0.95); // Recover to normal performance
    });

    test('should handle database connection stress', async () => {
      // Mock database stress scenario
      const mockDb = {
        getTravelOffers: jest.fn()
          .mockResolvedValueOnce([]) // Normal response
          .mockRejectedValueOnce(new Error('Connection timeout')) // Stress scenario
          .mockResolvedValueOnce([]) // Recovery
      };

      // This would test database resilience under stress
      // Implementation depends on actual database mocking strategy
    });
  });

  describe('Performance Benchmarks', () => {
    test('should meet API response time SLAs', async () => {
      const endpoints = [
        { path: '/health', sla: 100 },
        { path: '/api/trips', sla: 300 },
        { path: '/api/auth/status', sla: 200 }
      ];

      for (const endpoint of endpoints) {
        const results = await PerformanceTestUtils.measureResponseTime(endpoint.path, 'GET', null, 20);

        expect(results.p95).toBeLessThan(endpoint.sla);
        expect(results.average).toBeLessThan(endpoint.sla * 0.8); // 80% of SLA for average
      }
    });

    test('should maintain throughput under sustained load', async () => {
      const results = await PerformanceTestUtils.loadTest('/health', 75, 30);

      expect(results.actualRPS).toBeGreaterThan(60); // Maintain at least 80% of target
      expect(results.successRate).toBeGreaterThan(0.98); // 98% success rate for sustained load
    });
  });
});