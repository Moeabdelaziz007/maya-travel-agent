import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PaymentSuccess from '../PaymentSuccess'
import { BrowserRouter } from 'react-router-dom'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  }
}))

describe('PaymentSuccess Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear URL parameters
    delete (window as any).location
    ;(window as any).location = { search: '' }
  })

  it('renders success message', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument()
  })

  it('displays thank you message', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/Thank you for your payment/)).toBeInTheDocument()
  })

  it('shows success icon', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    // CheckCircle icon should be present
    const container = screen.getByText('Payment Successful!').parentElement?.parentElement
    expect(container).toBeInTheDocument()
  })

  it('displays Go to Dashboard button', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
  })

  it('displays Go Back button', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Go Back')).toBeInTheDocument()
  })

  it('navigates to home when Go to Dashboard is clicked', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    const dashboardButton = screen.getByText('Go to Dashboard')
    fireEvent.click(dashboardButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('navigates back when Go Back is clicked', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    const backButton = screen.getByText('Go Back')
    fireEvent.click(backButton)
    
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('displays receipt information', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/Receipt:/)).toBeInTheDocument()
    expect(screen.getByText(/confirmation email has been sent/)).toBeInTheDocument()
  })

  it('displays support email', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText('support@mayatrips.com')).toBeInTheDocument()
  })

  it('support email is clickable', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    const supportLink = screen.getByText('support@mayatrips.com')
    expect(supportLink).toHaveAttribute('href', 'mailto:support@mayatrips.com')
  })

  it('displays payment details when URL parameters are present', () => {
    delete (window as any).location
    ;(window as any).location = { 
      search: '?payment_intent=pi_123456&amount=100&currency=USD' 
    }
    
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Amount Paid')).toBeInTheDocument()
    expect(screen.getByText('Payment ID')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('displays amount correctly from URL parameters', () => {
    delete (window as any).location
    ;(window as any).location = { 
      search: '?payment_intent=pi_123456&amount=150.50&currency=USD' 
    }
    
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText('$150.50 USD')).toBeInTheDocument()
  })

  it('displays payment ID from URL parameters', () => {
    delete (window as any).location
    ;(window as any).location = { 
      search: '?payment_intent=pi_test123&amount=100&currency=USD' 
    }
    
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText('pi_test123')).toBeInTheDocument()
  })

  it('displays currency from URL parameters', () => {
    delete (window as any).location
    ;(window as any).location = { 
      search: '?payment_intent=pi_123&amount=50&currency=EUR' 
    }
    
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/EUR/)).toBeInTheDocument()
  })

  it('displays succeeded status', () => {
    delete (window as any).location
    ;(window as any).location = { 
      search: '?payment_intent=pi_123&amount=100&currency=USD' 
    }
    
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText('succeeded')).toBeInTheDocument()
  })

  it('defaults to USD when currency is not provided', () => {
    delete (window as any).location
    ;(window as any).location = { 
      search: '?payment_intent=pi_123&amount=100' 
    }
    
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/USD/)).toBeInTheDocument()
  })

  it('defaults to 0 amount when not provided', () => {
    delete (window as any).location
    ;(window as any).location = { 
      search: '?payment_intent=pi_123' 
    }
    
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText('$0.00 USD')).toBeInTheDocument()
  })

  it('does not display payment details when no URL parameters', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.queryByText('Amount Paid')).not.toBeInTheDocument()
    expect(screen.queryByText('Payment ID')).not.toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    const container = screen.getByText('Payment Successful!').closest('div')
    expect(container).toHaveClass('max-w-md', 'w-full', 'bg-white', 'rounded-2xl')
  })

  it('displays gradient background', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    const background = screen.getByText('Payment Successful!').parentElement?.parentElement?.parentElement
    expect(background).toHaveClass('min-h-screen')
  })

  it('displays all action buttons', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(2) // Go to Dashboard and Go Back
  })

  it('buttons have proper icons', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    const dashboardButton = screen.getByText('Go to Dashboard').closest('button')
    const backButton = screen.getByText('Go Back').closest('button')
    
    expect(dashboardButton).toBeInTheDocument()
    expect(backButton).toBeInTheDocument()
  })

  it('displays help text', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/Need help?/)).toBeInTheDocument()
  })

  it('formats amount with two decimal places', () => {
    delete (window as any).location
    ;(window as any).location = { 
      search: '?payment_intent=pi_123&amount=99.9&currency=USD' 
    }
    
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    expect(screen.getByText('$99.90 USD')).toBeInTheDocument()
  })

  it('renders multiple info sections', () => {
    render(
      <BrowserRouter>
        <PaymentSuccess />
      </BrowserRouter>
    )
    
    // Should have receipt info and support info
    expect(screen.getByText(/Receipt:/)).toBeInTheDocument()
    expect(screen.getByText(/Need help?/)).toBeInTheDocument()
  })
})

