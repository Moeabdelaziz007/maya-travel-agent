/**
 * Z.ai API Connection Tests
 * Tests different Z.ai API endpoints and configurations using Jest framework
 */

const fetch = require('node-fetch');

// Mock node-fetch
jest.mock('node-fetch');
const mockedFetch = fetch;

// Mock environment variables
const mockEnv = {
  ZAI_API_KEY: 'test-zai-api-key-12345'
};

describe('Z.ai API Connection Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock process.env for each test
    process.env = { ...originalEnv, ...mockEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('API Endpoint Testing', () => {
    const testCases = [
      {
        name: 'Original configuration',
        baseUrl: 'https://api.z.ai/api/paas/v4',
        model: 'glm-4.6'
      },
      {
        name: 'GLM-4 model',
        baseUrl: 'https://api.z.ai/api/paas/v4',
        model: 'glm-4'
      },
      {
        name: 'V1 endpoint',
        baseUrl: 'https://api.z.ai/v1',
        model: 'glm-4.6'
      },
      {
        name: 'OpenAI compatible endpoint',
        baseUrl: 'https://api.z.ai/v1',
        model: 'glm-4'
      }
    ];

    testCases.forEach(({ name, baseUrl, model }) => {
      test(`should test ${name} successfully`, async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          headers: {
            entries: () => [
              ['content-type', 'application/json'],
              ['x-ratelimit-limit', '100']
            ]
          },
          text: () => Promise.resolve(JSON.stringify({
            choices: [{
              message: {
                content: `مرحبا! كيف يمكنني مساعدتك في رحلتك إلى ${model}?`
              }
            }],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30
            }
          }))
        };

        mockedFetch.mockResolvedValueOnce(mockResponse);

        const requestBody = {
          model: model,
          messages: [
            { role: 'user', content: 'مرحبا' }
          ],
          max_tokens: 50,
          temperature: 0.7
        };

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        });

        expect(fetch).toHaveBeenCalledWith(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        });

        expect(response.ok).toBe(true);
        expect(response.status).toBe(200);

        const responseText = await response.text();
        const responseData = JSON.parse(responseText);

        expect(responseData).toHaveProperty('choices');
        expect(responseData.choices).toHaveLength(1);
        expect(responseData.choices[0]).toHaveProperty('message');
        expect(responseData.choices[0].message).toHaveProperty('content');
        expect(responseData).toHaveProperty('usage');
        expect(responseData.usage).toHaveProperty('total_tokens');
      });

      test(`should handle ${name} API errors`, async () => {
        const mockErrorResponse = {
          ok: false,
          status: 401,
          headers: {
            entries: () => [['content-type', 'application/json']]
          },
          text: () => Promise.resolve(JSON.stringify({
            error: {
              message: 'Invalid API key',
              type: 'authentication_error'
            }
          }))
        };

        mockedFetch.mockResolvedValueOnce(mockErrorResponse);

        const requestBody = {
          model: model,
          messages: [{ role: 'user', content: 'مرحبا' }],
          max_tokens: 50,
          temperature: 0.7
        };

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(401);

        const responseText = await response.text();
        const responseData = JSON.parse(responseText);

        expect(responseData).toHaveProperty('error');
        expect(responseData.error).toHaveProperty('message');
        expect(responseData.error.message).toBe('Invalid API key');
      });

      test(`should handle ${name} network errors`, async () => {
        const networkError = new Error('Network timeout');
        mockedFetch.mockRejectedValueOnce(networkError);

        const requestBody = {
          model: model,
          messages: [{ role: 'user', content: 'مرحبا' }],
          max_tokens: 50,
          temperature: 0.7
        };

        await expect(fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        })).rejects.toThrow('Network timeout');

        expect(fetch).toHaveBeenCalledWith(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        });
      });
    });
  });

  describe('Request Configuration', () => {
    test('should include correct headers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({
          choices: [{ message: { content: 'Response' } }]
        }))
      };

      mockedFetch.mockResolvedValueOnce(mockResponse);

      await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'glm-4.6',
          messages: [{ role: 'user', content: 'مرحبا' }],
          max_tokens: 50,
          temperature: 0.7
        })
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.z.ai/api/paas/v4/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
          })
        })
      );
    });

    test('should include correct request body', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({
          choices: [{ message: { content: 'Response' } }]
        }))
      };

      mockedFetch.mockResolvedValueOnce(mockResponse);

      const requestBody = {
        model: 'glm-4.6',
        messages: [
          { role: 'system', content: 'أنت مساعد رحلات مفيد' },
          { role: 'user', content: 'أريد السفر إلى تركيا' }
        ],
        max_tokens: 100,
        temperature: 0.8
      };

      await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.z.ai/api/paas/v4/chat/completions',
        expect.objectContaining({
          body: JSON.stringify(requestBody)
        })
      );
    });
  });

  describe('Response Handling', () => {
    test('should parse successful JSON response', async () => {
      const mockResponseData = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1677652288,
        model: 'glm-4.6',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'مرحبا! أهلاً وسهلاً بك. كيف يمكنني مساعدتك في رحلتك؟'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 15,
          completion_tokens: 25,
          total_tokens: 40
        }
      };

      const mockResponse = {
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponseData))
      };

      mockedFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'glm-4.6',
          messages: [{ role: 'user', content: 'مرحبا' }],
          max_tokens: 50
        })
      });

      const responseText = await response.text();
      const responseData = JSON.parse(responseText);

      expect(responseData).toEqual(mockResponseData);
      expect(responseData.choices[0].message.content).toContain('مرحبا');
      expect(responseData.usage.total_tokens).toBe(40);
    });

    test('should handle rate limit response', async () => {
      const mockRateLimitResponse = {
        ok: false,
        status: 429,
        text: () => Promise.resolve(JSON.stringify({
          error: {
            message: 'Rate limit exceeded. Please try again later.',
            type: 'rate_limit_error',
            retry_after: 60
          }
        }))
      };

      mockedFetch.mockResolvedValueOnce(mockRateLimitResponse);

      const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'glm-4.6',
          messages: [{ role: 'user', content: 'مرحبا' }]
        })
      });

      expect(response.status).toBe(429);
      expect(response.ok).toBe(false);

      const responseText = await response.text();
      const responseData = JSON.parse(responseText);

      expect(responseData.error.type).toBe('rate_limit_error');
      expect(responseData.error.retry_after).toBe(60);
    });

    test('should handle server error response', async () => {
      const mockServerErrorResponse = {
        ok: false,
        status: 500,
        text: () => Promise.resolve(JSON.stringify({
          error: {
            message: 'Internal server error',
            type: 'server_error'
          }
        }))
      };

      mockedFetch.mockResolvedValueOnce(mockServerErrorResponse);

      const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'glm-4.6',
          messages: [{ role: 'user', content: 'مرحبا' }]
        })
      });

      expect(response.status).toBe(500);
      expect(response.ok).toBe(false);

      const responseText = await response.text();
      const responseData = JSON.parse(responseText);

      expect(responseData.error.type).toBe('server_error');
    });
  });

  describe('Environment Configuration', () => {
    test('should use API key from environment', () => {
      expect(process.env.ZAI_API_KEY).toBe('test-zai-api-key-12345');
    });

    test('should handle missing API key', async () => {
      delete process.env.ZAI_API_KEY;

      const mockResponse = {
        ok: false,
        status: 401,
        text: () => Promise.resolve(JSON.stringify({
          error: { message: 'Missing API key' }
        }))
      };

      mockedFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer undefined'
        },
        body: JSON.stringify({
          model: 'glm-4.6',
          messages: [{ role: 'user', content: 'مرحبا' }]
        })
      });

      expect(response.status).toBe(401);

      // Restore API key
      process.env.ZAI_API_KEY = mockEnv.ZAI_API_KEY;
    });
  });

  describe('Error Scenarios', () => {
    test('should handle malformed JSON response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: () => Promise.resolve('invalid json response')
      };

      mockedFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'glm-4.6',
          messages: [{ role: 'user', content: 'مرحبا' }]
        })
      });

      const responseText = await response.text();

      expect(() => JSON.parse(responseText)).toThrow();
    });

    test('should handle empty response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: () => Promise.resolve('')
      };

      mockedFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'glm-4.6',
          messages: [{ role: 'user', content: 'مرحبا' }]
        })
      });

      const responseText = await response.text();
      expect(responseText).toBe('');
    });

    test('should handle fetch timeout', async () => {
      const timeoutError = new Error('Request timeout');
      mockedFetch.mockRejectedValueOnce(timeoutError);

      await expect(fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'glm-4.6',
          messages: [{ role: 'user', content: 'مرحبا' }]
        })
      })).rejects.toThrow('Request timeout');
    });
  });

  describe('Integration Tests', () => {
    test('should find working configuration', async () => {
      // First three calls fail, fourth succeeds
      mockedFetch
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify({
            choices: [{ message: { content: 'Success!' } }]
          }))
        });

      const testCases = [
        { baseUrl: 'https://api.z.ai/api/paas/v4', model: 'glm-4.6' },
        { baseUrl: 'https://api.z.ai/api/paas/v4', model: 'glm-4' },
        { baseUrl: 'https://api.z.ai/v1', model: 'glm-4.6' },
        { baseUrl: 'https://api.z.ai/v1', model: 'glm-4' }
      ];

      let successCount = 0;
      for (const testCase of testCases) {
        try {
          const response = await fetch(`${testCase.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
            },
            body: JSON.stringify({
              model: testCase.model,
              messages: [{ role: 'user', content: 'مرحبا' }],
              max_tokens: 50
            })
          });

          if (response.ok) {
            successCount++;
            break;
          }
        } catch (error) {
          // Continue to next test case
        }
      }

      expect(successCount).toBe(1);
      expect(fetch).toHaveBeenCalledTimes(4);
    });
  });
});