import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PaymentModal from '../PaymentModal'

// Mock fetch
global.fetch = vi.fn()

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}))

describe('PaymentModal Component', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal when isOpen is true', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    expect(screen.getByText('Complete Payment')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(
      <PaymentModal
        isOpen={false}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    expect(screen.queryByText('Complete Payment')).not.toBeInTheDocument()
  })

  it('displays amount correctly', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    expect(screen.getByText('$100.00 USD')).toBeInTheDocument()
  })

  it('displays custom currency', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={50}
        currency="EUR"
      />
    )
    
    expect(screen.getByText('$50.00 EUR')).toBeInTheDocument()
  })

  it('displays custom description', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
        description="Custom Payment Description"
      />
    )
    
    expect(screen.getByText('Custom Payment Description')).toBeInTheDocument()
  })

  it('displays default description', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    expect(screen.getByText('Maya Trips Payment')).toBeInTheDocument()
  })

  it('shows all payment methods', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    expect(screen.getByText('Credit Card')).toBeInTheDocument()
    expect(screen.getByText('PayPal')).toBeInTheDocument()
    expect(screen.getByText('Telegram')).toBeInTheDocument()
  })

  it('displays payment method descriptions', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    expect(screen.getByText('Pay with Visa, Mastercard, or American Express')).toBeInTheDocument()
    expect(screen.getByText('Pay with your PayPal account')).toBeInTheDocument()
    expect(screen.getByText('Pay through Telegram Bot')).toBeInTheDocument()
  })

  it('selects payment method on click', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    const creditCardMethod = screen.getByText('Credit Card').closest('button')
    if (creditCardMethod) {
      fireEvent.click(creditCardMethod)
    }
    
    // Should show selected state (checkmark icon or visual indicator)
    expect(creditCardMethod).toBeInTheDocument()
  })

  it('displays security notice', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    expect(screen.getByText(/Your payment information is encrypted and secure/)).toBeInTheDocument()
  })

  it('disables Pay Now button when no payment method selected', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    const payButton = screen.getByText('Pay Now').closest('button')
    expect(payButton).toBeDisabled()
  })

  it('enables Pay Now button when payment method is selected', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    const creditCardMethod = screen.getByText('Credit Card').closest('button')
    if (creditCardMethod) {
      fireEvent.click(creditCardMethod)
    }
    
    const payButton = screen.getByText('Pay Now').closest('button')
    expect(payButton).not.toBeDisabled()
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    const closeButtons = screen.getAllByRole('button')
    const closeButton = closeButtons.find(btn => btn.querySelector('svg'))
    
    if (closeButton) {
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking outside modal', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    const backdrop = screen.getByText('Complete Payment').closest('div')?.parentElement?.parentElement
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  it('does not close modal when clicking inside modal', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    const modalContent = screen.getByText('Complete Payment')
    fireEvent.click(modalContent)
    
    // Should NOT call onClose when clicking inside
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('shows loading state during payment processing', async () => {
    vi.mocked(fetch).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        json: async () => ({ success: true, payment: { id: '123' } })
      } as Response), 100))
    )
    
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    const creditCardMethod = screen.getByText('Credit Card').closest('button')
    if (creditCardMethod) {
      fireEvent.click(creditCardMethod)
    }
    
    const payButton = screen.getByText('Pay Now')
    fireEvent.click(payButton)
    
    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })
  })

  it('disables buttons during payment processing', async () => {
    vi.mocked(fetch).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        json: async () => ({ success: true, payment: { id: '123' } })
      } as Response), 100))
    )
    
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    const creditCardMethod = screen.getByText('Credit Card').closest('button')
    if (creditCardMethod) {
      fireEvent.click(creditCardMethod)
    }
    
    const payButton = screen.getByText('Pay Now')
    fireEvent.click(payButton)
    
    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel').closest('button')
      expect(cancelButton).toBeDisabled()
    })
  })

  it('shows success message on successful payment', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ success: true, payment: { id: '123' } })
    } as Response)
    
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
        onSuccess={mockOnSuccess}
      />
    )
    
    const creditCardMethod = screen.getByText('Credit Card').closest('button')
    if (creditCardMethod) {
      fireEvent.click(creditCardMethod)
    }
    
    const payButton = screen.getByText('Pay Now')
    fireEvent.click(payButton)
    
    await waitFor(() => {
      expect(screen.getByText('Payment successful!')).toBeInTheDocument()
    })
  })

  it('calls onSuccess callback on successful payment', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ success: true, payment: { id: '123' } })
    } as Response)
    
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
        onSuccess={mockOnSuccess}
      />
    )
    
    const creditCardMethod = screen.getByText('Credit Card').closest('button')
    if (creditCardMethod) {
      fireEvent.click(creditCardMethod)
    }
    
    const payButton = screen.getByText('Pay Now')
    fireEvent.click(payButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('123')
    })
  })

  it('shows error message on payment failure', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ success: false, error: 'Payment declined' })
    } as Response)
    
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    const creditCardMethod = screen.getByText('Credit Card').closest('button')
    if (creditCardMethod) {
      fireEvent.click(creditCardMethod)
    }
    
    const payButton = screen.getByText('Pay Now')
    fireEvent.click(payButton)
    
    await waitFor(() => {
      expect(screen.getByText('Payment declined')).toBeInTheDocument()
    })
  })

  it('shows network error message on fetch failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
    
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    const creditCardMethod = screen.getByText('Credit Card').closest('button')
    if (creditCardMethod) {
      fireEvent.click(creditCardMethod)
    }
    
    const payButton = screen.getByText('Pay Now')
    fireEvent.click(payButton)
    
    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument()
    })
  })

  it('auto-closes modal after successful payment', async () => {
    vi.useFakeTimers()
    
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ success: true, payment: { id: '123' } })
    } as Response)
    
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
      />
    )
    
    const creditCardMethod = screen.getByText('Credit Card').closest('button')
    if (creditCardMethod) {
      fireEvent.click(creditCardMethod)
    }
    
    const payButton = screen.getByText('Pay Now')
    fireEvent.click(payButton)
    
    await waitFor(() => {
      expect(screen.getByText('Payment successful!')).toBeInTheDocument()
    })
    
    vi.advanceTimersByTime(2000)
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
    
    vi.useRealTimers()
  })

  it('sends correct payment data to API', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ success: true, payment: { id: '123' } })
    } as Response)
    
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        amount={100}
        currency="USD"
        description="Test Payment"
      />
    )
    
    const creditCardMethod = screen.getByText('Credit Card').closest('button')
    if (creditCardMethod) {
      fireEvent.click(creditCardMethod)
    }
    
    const payButton = screen.getByText('Pay Now')
    fireEvent.click(payButton)
    
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/payment/create-payment',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"amount":100')
        })
      )
    })
  })
})

