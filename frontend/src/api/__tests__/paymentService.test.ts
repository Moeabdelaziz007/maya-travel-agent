import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PaymentService } from '../paymentService'

// Mock fetch
global.fetch = vi.fn()

describe('PaymentService Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPayment', () => {
    it('creates a payment successfully', async () => {
      const mockResponse = {
        success: true,
        payment: {
          id: 'pay_123',
          amount: 100,
          currency: 'USD',
          status: 'pending',
          description: 'Test payment',
          created_at: '2024-01-01'
        }
      }

      vi.mocked(fetch).mockResolvedValue({
        json: async () => mockResponse
      } as Response)

      const result = await PaymentService.createPayment({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'stripe',
        description: 'Test payment'
      })

      expect(result.success).toBe(true)
      expect(result.payment?.id).toBe('pay_123')
    })

    it('handles network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const result = await PaymentService.createPayment({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'stripe',
        description: 'Test payment'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error. Please check your connection.')
    })

    it('sends correct request body', async () => {
      const mockResponse = { success: true, payment: {} }
      const fetchMock = vi.mocked(fetch).mockResolvedValue({
        json: async () => mockResponse
      } as Response)

      await PaymentService.createPayment({
        amount: 150,
        currency: 'EUR',
        paymentMethod: 'paypal',
        description: 'PayPal test',
        chatId: 'chat123'
      })

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/payment/create-payment',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"amount":150')
        })
      )
    })
  })

  describe('confirmPayment', () => {
    it('confirms payment successfully', async () => {
      const mockResponse = {
        success: true,
        payment: {
          id: 'pay_123',
          amount: 100,
          currency: 'USD',
          status: 'succeeded',
          description: 'Test payment',
          created_at: '2024-01-01'
        }
      }

      vi.mocked(fetch).mockResolvedValue({
        json: async () => mockResponse
      } as Response)

      const result = await PaymentService.confirmPayment('pay_123', 'stripe')

      expect(result.success).toBe(true)
      expect(result.payment?.status).toBe('succeeded')
    })

    it('handles confirmation errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Connection error'))

      const result = await PaymentService.confirmPayment('pay_123', 'stripe')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error. Please check your connection.')
    })
  })

  describe('getPaymentStatus', () => {
    it('retrieves payment status', async () => {
      const mockResponse = {
        success: true,
        payment: {
          id: 'pay_123',
          status: 'succeeded' as const,
          amount: 100,
          currency: 'USD',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      }

      vi.mocked(fetch).mockResolvedValue({
        json: async () => mockResponse
      } as Response)

      const result = await PaymentService.getPaymentStatus('pay_123')

      expect(result.success).toBe(true)
      expect(result.payment?.status).toBe('succeeded')
    })

    it('handles status check errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const result = await PaymentService.getPaymentStatus('pay_123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error. Please check your connection.')
    })
  })

  describe('createTelegramPayment', () => {
    it('creates Telegram payment', async () => {
      const mockResponse = {
        success: true,
        payment: {
          id: 'tg_pay_123',
          amount: 50,
          currency: 'USD',
          status: 'pending',
          description: 'Telegram payment',
          created_at: '2024-01-01'
        }
      }

      vi.mocked(fetch).mockResolvedValue({
        json: async () => mockResponse
      } as Response)

      const result = await PaymentService.createTelegramPayment(50, 'Telegram payment', 'chat123')

      expect(result.success).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        '/api/payment/create-payment',
        expect.objectContaining({
          body: expect.stringContaining('"paymentMethod":"telegram"')
        })
      )
    })
  })

  describe('createStripePaymentLink', () => {
    it('creates Stripe payment link', async () => {
      const mockResponse = {
        success: true,
        paymentLink: {
          id: 'link_123',
          url: 'https://checkout.stripe.com/pay/link_123',
          amount: 100,
          currency: 'USD',
          description: 'Test payment',
          status: 'active'
        }
      }

      vi.mocked(fetch).mockResolvedValue({
        json: async () => mockResponse
      } as Response)

      const result = await PaymentService.createStripePaymentLink(
        100,
        'Test payment',
        'test@example.com'
      )

      expect(result.success).toBe(true)
      expect(result.paymentLink?.url).toContain('stripe.com')
    })

    it('handles payment link creation errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const result = await PaymentService.createStripePaymentLink(100, 'Test payment')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error. Please check your connection.')
    })
  })

  describe('createStripePayment', () => {
    it('creates Stripe payment', async () => {
      const mockResponse = { success: true, payment: { id: 'pay_stripe' } }
      vi.mocked(fetch).mockResolvedValue({
        json: async () => mockResponse
      } as Response)

      const result = await PaymentService.createStripePayment(100, 'Stripe payment')

      expect(result.success).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        '/api/payment/create-payment',
        expect.objectContaining({
          body: expect.stringContaining('"paymentMethod":"stripe"')
        })
      )
    })
  })

  describe('createPayPalPayment', () => {
    it('creates PayPal payment', async () => {
      const mockResponse = { success: true, payment: { id: 'pay_paypal' } }
      vi.mocked(fetch).mockResolvedValue({
        json: async () => mockResponse
      } as Response)

      const result = await PaymentService.createPayPalPayment(100, 'PayPal payment')

      expect(result.success).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        '/api/payment/create-payment',
        expect.objectContaining({
          body: expect.stringContaining('"paymentMethod":"paypal"')
        })
      )
    })
  })

  describe('formatAmount', () => {
    it('formats amount in USD', () => {
      const formatted = PaymentService.formatAmount(100, 'USD')
      expect(formatted).toMatch(/\$100/)
    })

    it('formats amount in EUR', () => {
      const formatted = PaymentService.formatAmount(100, 'EUR')
      expect(formatted).toContain('100')
    })

    it('formats decimal amounts correctly', () => {
      const formatted = PaymentService.formatAmount(99.99, 'USD')
      expect(formatted).toMatch(/\$99\.99/)
    })

    it('uses USD as default currency', () => {
      const formatted = PaymentService.formatAmount(50)
      expect(formatted).toMatch(/\$50/)
    })
  })

  describe('validateAmount', () => {
    it('validates positive amounts', () => {
      const result = PaymentService.validateAmount(100)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects zero amount', () => {
      const result = PaymentService.validateAmount(0)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Amount must be greater than 0')
    })

    it('rejects negative amounts', () => {
      const result = PaymentService.validateAmount(-50)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Amount must be greater than 0')
    })

    it('rejects amounts over $10,000', () => {
      const result = PaymentService.validateAmount(10001)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Amount cannot exceed $10,000')
    })

    it('accepts $10,000', () => {
      const result = PaymentService.validateAmount(10000)
      expect(result.valid).toBe(true)
    })

    it('accepts small amounts', () => {
      const result = PaymentService.validateAmount(0.01)
      expect(result.valid).toBe(true)
    })
  })

  describe('getSupportedMethods', () => {
    it('returns all supported payment methods', () => {
      const methods = PaymentService.getSupportedMethods()
      
      expect(methods).toHaveLength(3)
      expect(methods.map(m => m.id)).toContain('stripe')
      expect(methods.map(m => m.id)).toContain('paypal')
      expect(methods.map(m => m.id)).toContain('telegram')
    })

    it('includes method descriptions', () => {
      const methods = PaymentService.getSupportedMethods()
      
      methods.forEach(method => {
        expect(method.name).toBeTruthy()
        expect(method.description).toBeTruthy()
        expect(typeof method.available).toBe('boolean')
      })
    })

    it('marks all methods as available', () => {
      const methods = PaymentService.getSupportedMethods()
      
      methods.forEach(method => {
        expect(method.available).toBe(true)
      })
    })
  })
})

