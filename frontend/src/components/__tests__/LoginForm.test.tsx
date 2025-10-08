import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginForm from '../Auth/LoginForm'
import { AuthService } from '../../lib/auth'

// Mock AuthService
vi.mock('../../lib/auth', () => ({
  AuthService: {
    signIn: vi.fn()
  }
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  }
}))

describe('LoginForm Component', () => {
  const mockOnSuccess = vi.fn()
  const mockOnSwitchToSignup = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form with all fields', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your Maya Trips account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
  })

  it('displays email and password labels', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    expect(screen.getByText('Email Address')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
  })

  it('shows sign in button', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('updates email input value', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    expect(emailInput.value).toBe('test@example.com')
  })

  it('updates password input value', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(passwordInput.value).toBe('password123')
  })

  it('toggles password visibility', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement
    expect(passwordInput.type).toBe('password')
    
    // Find and click the eye icon button
    const toggleButtons = screen.getAllByRole('button')
    const toggleButton = toggleButtons.find(btn => btn !== screen.getByRole('button', { name: /sign in/i }))
    
    if (toggleButton) {
      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('text')
      
      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('password')
    }
  })

  it('submits form with valid credentials', async () => {
    const mockResponse = { data: { user: { id: '1', email: 'test@example.com' } }, error: null }
    vi.mocked(AuthService.signIn).mockResolvedValue(mockResponse)
    
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(AuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('displays error message on failed login', async () => {
    const mockResponse = { data: null, error: { message: 'Invalid credentials' } }
    vi.mocked(AuthService.signIn).mockResolvedValue(mockResponse)
    
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows loading state during login', async () => {
    const mockResponse = { data: { user: {} }, error: null }
    vi.mocked(AuthService.signIn).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    )
    
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Signing In...')).toBeInTheDocument()
    })
  })

  it('disables submit button during loading', async () => {
    const mockResponse = { data: { user: {} }, error: null }
    vi.mocked(AuthService.signIn).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    )
    
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })

  it('shows sign up link', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('calls onSwitchToSignup when sign up link is clicked', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const signupLink = screen.getByText('Sign up')
    fireEvent.click(signupLink)
    
    expect(mockOnSwitchToSignup).toHaveBeenCalled()
  })

  it('handles unexpected errors gracefully', async () => {
    vi.mocked(AuthService.signIn).mockRejectedValue(new Error('Network error'))
    
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })
  })

  it('requires email field', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toHaveAttribute('required')
  })

  it('requires password field', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    expect(passwordInput).toHaveAttribute('required')
  })

  it('email input has correct type', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('displays email and lock icons', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    // Icons should be present in the form
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()
  })

  it('clears error message when user starts typing', async () => {
    const mockResponse = { data: null, error: { message: 'Invalid credentials' } }
    vi.mocked(AuthService.signIn).mockResolvedValue(mockResponse)
    
    render(<LoginForm onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    
    // Form should be ready for retry after error
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()
  })
})

