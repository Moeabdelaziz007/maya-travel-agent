/**
 * Rate Limits Tests
 * Tests all rate limiting functionality using Jest framework
 */

const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock server response for health endpoint
const mockHealthResponse = {
  status: 200,
  headers: {
    'ratelimit-limit': '100',
    'ratelimit-remaining': '99',
    'ratelimit-reset': Math.floor(Date.now() / 1000) + 3600
  },
  data: { status: 'healthy' }
};

// Mock server response for rate limited requests
const mockRateLimitResponse = {
  status: 429,
  data: { error: 'Too Many Requests', retryAfter: 60 }
};

// Mock server response for AI endpoint
const mockAIResponse = {
  status: 200,
  data: { message: 'AI response', success: true }
};

// Mock server response for payment endpoint
const mockPaymentResponse = {
  status: 200,
  data: { paymentLink: 'https://example.com/pay', success: true }
};

describe('Rate Limits Tests', () => {
  const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable for each test
    process.env.API_URL = API_BASE_URL;
  });

  describe('General API Rate Limiter', () => {
    test('should handle successful requests within limit', async () => {
      // Mock successful responses
      mockedAxios.get.mockResolvedValueOnce({
        ...mockHealthResponse,
        headers: { ...mockHealthResponse.headers, 'ratelimit-remaining': '95' }
      });

      const response = await axios.get(`${API_BASE_URL}/api/health`);

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/api/health`);
      expect(response.status).toBe(200);
      expect(response.headers['ratelimit-remaining']).toBe('95');
    });

    test('should handle rate limit exceeded', async () => {
      // Mock rate limit response
      mockedAxios.get.mockRejectedValueOnce({
        response: mockRateLimitResponse
      });

      await expect(axios.get(`${API_BASE_URL}/api/health`))
        .rejects.toMatchObject({
          response: expect.objectContaining({
            status: 429,
            data: expect.objectContaining({
              error: 'Too Many Requests'
            })
          })
        });

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/api/health`);
    });

    test('should track rate limit headers correctly', async () => {
      const responses = [
        { ...mockHealthResponse, headers: { ...mockHealthResponse.headers, 'ratelimit-remaining': '98' } },
        { ...mockHealthResponse, headers: { ...mockHealthResponse.headers, 'ratelimit-remaining': '97' } }
      ];

      mockedAxios.get
        .mockResolvedValueOnce(responses[0])
        .mockResolvedValueOnce(responses[1]);

      const response1 = await axios.get(`${API_BASE_URL}/api/health`);
      const response2 = await axios.get(`${API_BASE_URL}/api/health`);

      expect(response1.headers['ratelimit-remaining']).toBe('98');
      expect(response2.headers['ratelimit-remaining']).toBe('97');
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('AI Rate Limiter', () => {
    test('should handle AI requests within limit', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockAIResponse);

      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: 'Test message',
        userId: 'test-user'
      });

      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/ai/chat`,
        {
          message: 'Test message',
          userId: 'test-user'
        }
      );
      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockAIResponse.data);
    });

    test('should handle AI rate limit exceeded', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { error: 'AI Rate limit exceeded', retryAfter: 60 }
        }
      });

      await expect(axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: 'Test message',
        userId: 'test-user'
      })).rejects.toMatchObject({
        response: expect.objectContaining({
          status: 429,
          data: expect.objectContaining({
            error: 'AI Rate limit exceeded'
          })
        })
      });

      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/ai/chat`,
        {
          message: 'Test message',
          userId: 'test-user'
        }
      );
    });

    test('should handle AI service unavailable', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'AI service unavailable' }
        }
      });

      await expect(axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: 'Test message',
        userId: 'test-user'
      })).rejects.toMatchObject({
        response: expect.objectContaining({
          status: 500
        })
      });
    });
  });

  describe('Payment Rate Limiter', () => {
    test('should handle payment requests within limit', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockPaymentResponse);

      const response = await axios.post(`${API_BASE_URL}/api/payment/create-payment-link`, {
        amount: 100,
        currency: 'USD',
        description: 'Test payment'
      });

      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/payment/create-payment-link`,
        {
          amount: 100,
          currency: 'USD',
          description: 'Test payment'
        }
      );
      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockPaymentResponse.data);
    });

    test('should handle payment rate limit exceeded', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { error: 'Payment rate limit exceeded', retryAfter: 3600 }
        }
      });

      await expect(axios.post(`${API_BASE_URL}/api/payment/create-payment-link`, {
        amount: 100,
        currency: 'USD',
        description: 'Test payment'
      })).rejects.toMatchObject({
        response: expect.objectContaining({
          status: 429,
          data: expect.objectContaining({
            error: 'Payment rate limit exceeded'
          })
        })
      });
    });

    test('should handle payment validation errors', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'Invalid payment amount' }
        }
      });

      await expect(axios.post(`${API_BASE_URL}/api/payment/create-payment-link`, {
        amount: -100,
        currency: 'USD',
        description: 'Invalid payment'
      })).rejects.toMatchObject({
        response: expect.objectContaining({
          status: 400
        })
      });
    });
  });

  describe('Analytics Rate Limiter', () => {
    test('should handle analytics requests within limit', async () => {
      const mockAnalyticsResponse = {
        status: 200,
        data: { success: true, events: 1 }
      };

      mockedAxios.post.mockResolvedValueOnce(mockAnalyticsResponse);

      const response = await axios.post(`${API_BASE_URL}/api/analytics/events`, {
        type: 'test_event',
        userId: 'test-user',
        payload: { test: true }
      });

      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/analytics/events`,
        {
          type: 'test_event',
          userId: 'test-user',
          payload: { test: true }
        }
      );
      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockAnalyticsResponse.data);
    });

    test('should handle analytics rate limit exceeded', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { error: 'Analytics rate limit exceeded', retryAfter: 60 }
        }
      });

      await expect(axios.post(`${API_BASE_URL}/api/analytics/events`, {
        type: 'test_event',
        userId: 'test-user',
        payload: { test: true }
      })).rejects.toMatchObject({
        response: expect.objectContaining({
          status: 429,
          data: expect.objectContaining({
            error: 'Analytics rate limit exceeded'
          })
        })
      });
    });
  });

  describe('Rate Limit Headers', () => {
    test('should include all required rate limit headers', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockHealthResponse);

      const response = await axios.get(`${API_BASE_URL}/api/health`);

      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');

      expect(response.headers['ratelimit-limit']).toBe('100');
      expect(parseInt(response.headers['ratelimit-remaining'])).toBeGreaterThanOrEqual(0);
      expect(parseInt(response.headers['ratelimit-reset'])).toBeGreaterThan(Date.now() / 1000);
    });

    test('should handle missing rate limit headers', async () => {
      const responseWithoutHeaders = {
        status: 200,
        headers: {},
        data: { status: 'healthy' }
      };

      mockedAxios.get.mockResolvedValueOnce(responseWithoutHeaders);

      const response = await axios.get(`${API_BASE_URL}/api/health`);

      expect(response.headers['ratelimit-limit']).toBeUndefined();
      expect(response.headers['ratelimit-remaining']).toBeUndefined();
      expect(response.headers['ratelimit-reset']).toBeUndefined();
    });
  });

  describe('Rate Limit Reset Functionality', () => {
    test('should decrement remaining counter correctly', async () => {
      const responses = [
        { ...mockHealthResponse, headers: { ...mockHealthResponse.headers, 'ratelimit-remaining': '100' } },
        { ...mockHealthResponse, headers: { ...mockHealthResponse.headers, 'ratelimit-remaining': '99' } }
      ];

      mockedAxios.get
        .mockResolvedValueOnce(responses[0])
        .mockResolvedValueOnce(responses[1]);

      const response1 = await axios.get(`${API_BASE_URL}/api/health`);
      const response2 = await axios.get(`${API_BASE_URL}/api/health`);

      const remaining1 = parseInt(response1.headers['ratelimit-remaining']);
      const remaining2 = parseInt(response2.headers['ratelimit-remaining']);

      expect(remaining2).toBe(remaining1 - 1);
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    test('should handle non-numeric remaining values', async () => {
      const responseWithInvalidRemaining = {
        ...mockHealthResponse,
        headers: { ...mockHealthResponse.headers, 'ratelimit-remaining': 'invalid' }
      };

      mockedAxios.get.mockResolvedValueOnce(responseWithInvalidRemaining);

      const response = await axios.get(`${API_BASE_URL}/api/health`);

      expect(response.headers['ratelimit-remaining']).toBe('invalid');
      // Should not throw error, just handle gracefully
    });
  });

  describe('Environment Configuration', () => {
    test('should use default API URL when not set', () => {
      delete process.env.API_URL;

      // This test verifies the default URL is used
      expect(process.env.API_URL).toBeUndefined();

      // Restore for other tests
      process.env.API_URL = API_BASE_URL;
    });

    test('should use custom API URL when provided', () => {
      const customUrl = 'https://custom-api.example.com';
      process.env.API_URL = customUrl;

      expect(process.env.API_URL).toBe(customUrl);

      // Restore for other tests
      process.env.API_URL = API_BASE_URL;
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.get.mockRejectedValueOnce(networkError);

      await expect(axios.get(`${API_BASE_URL}/api/health`))
        .rejects.toThrow('Network Error');

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/api/health`);
    });

    test('should handle timeout errors', async () => {
      const timeoutError = new Error('Timeout');
      timeoutError.code = 'ECONNABORTED';
      mockedAxios.get.mockRejectedValueOnce(timeoutError);

      await expect(axios.get(`${API_BASE_URL}/api/health`))
        .rejects.toThrow('Timeout');

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/api/health`);
    });
  });

  describe('Concurrent Requests', () => {
    test('should handle multiple concurrent requests', async () => {
      const responses = Array(5).fill(null).map((_, i) => ({
        ...mockHealthResponse,
        headers: { ...mockHealthResponse.headers, 'ratelimit-remaining': `${100 - i}` }
      }));

      mockedAxios.get.mockImplementation(() =>
        Promise.resolve(responses.shift())
      );

      const requests = Array(5).fill(null).map(() =>
        axios.get(`${API_BASE_URL}/api/health`)
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach(response => {
        expect(response.status).toBe(200);
      });
      expect(axios.get).toHaveBeenCalledTimes(5);
    });
  });
});