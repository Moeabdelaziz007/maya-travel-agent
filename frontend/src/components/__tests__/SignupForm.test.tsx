import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SignupForm from '../Auth/SignupForm'
import { AuthService } from '../../lib/auth'

// Mock AuthService
vi.mock('../../lib/auth', () => ({
  AuthService: {
    signUp: vi.fn()
  }
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  }
}))

describe('SignupForm Component', () => {
  const mockOnSuccess = vi.fn()
  const mockOnSwitchToLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders signup form with all fields', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    expect(screen.getByText('Join Maya Trips')).toBeInTheDocument()
    expect(screen.getByText('Create your account and start planning')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument()
  })

  it('displays all field labels', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Email Address')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByText('Confirm Password')).toBeInTheDocument()
  })

  it('updates full name input value', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    const nameInput = screen.getByPlaceholderText('Enter your full name') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    
    expect(nameInput.value).toBe('John Doe')
  })

  it('updates email input value', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    
    expect(emailInput.value).toBe('john@example.com')
  })

  it('updates password input value', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    const passwordInput = screen.getByPlaceholderText('Create a password') as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(passwordInput.value).toBe('password123')
  })

  it('updates confirm password input value', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    const confirmInput = screen.getByPlaceholderText('Confirm your password') as HTMLInputElement
    fireEvent.change(confirmInput, { target: { value: 'password123' } })
    
    expect(confirmInput.value).toBe('password123')
  })

  it('shows error when passwords do not match', async () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password456' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
    
    expect(AuthService.signUp).not.toHaveBeenCalled()
  })

  it('shows error when password is too short', async () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: '12345' } })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: '12345' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
    
    expect(AuthService.signUp).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const mockResponse = { data: { user: { id: '1', email: 'john@example.com' } }, error: null }
    vi.mocked(AuthService.signUp).mockResolvedValue(mockResponse)
    
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password123' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(AuthService.signUp).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe')
    })
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('displays error message on failed signup', async () => {
    const mockResponse = { data: null, error: { message: 'Email already exists' } }
    vi.mocked(AuthService.signUp).mockResolvedValue(mockResponse)
    
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'existing@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password123' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
    
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows loading state during signup', async () => {
    const mockResponse = { data: { user: {} }, error: null }
    vi.mocked(AuthService.signUp).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    )
    
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password123' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Creating Account...')).toBeInTheDocument()
    })
  })

  it('disables submit button during loading', async () => {
    const mockResponse = { data: { user: {} }, error: null }
    vi.mocked(AuthService.signUp).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    )
    
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password123' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })

  it('toggles password visibility', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    const passwordInput = screen.getByPlaceholderText('Create a password') as HTMLInputElement
    expect(passwordInput.type).toBe('password')
    
    const toggleButtons = screen.getAllByRole('button')
    const passwordToggle = toggleButtons[0] // First toggle button for password
    
    fireEvent.click(passwordToggle)
    expect(passwordInput.type).toBe('text')
    
    fireEvent.click(passwordToggle)
    expect(passwordInput.type).toBe('password')
  })

  it('toggles confirm password visibility', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password') as HTMLInputElement
    expect(confirmPasswordInput.type).toBe('password')
    
    const toggleButtons = screen.getAllByRole('button')
    const confirmToggle = toggleButtons[1] // Second toggle button for confirm password
    
    fireEvent.click(confirmToggle)
    expect(confirmPasswordInput.type).toBe('text')
  })

  it('shows sign in link', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    expect(screen.getByText('Already have an account?')).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('calls onSwitchToLogin when sign in link is clicked', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    const loginLink = screen.getByText('Sign in')
    fireEvent.click(loginLink)
    
    expect(mockOnSwitchToLogin).toHaveBeenCalled()
  })

  it('handles unexpected errors gracefully', async () => {
    vi.mocked(AuthService.signUp).mockRejectedValue(new Error('Network error'))
    
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password123' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })
  })

  it('requires all fields', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    expect(screen.getByPlaceholderText('Enter your full name')).toHaveAttribute('required')
    expect(screen.getByPlaceholderText('Enter your email')).toHaveAttribute('required')
    expect(screen.getByPlaceholderText('Create a password')).toHaveAttribute('required')
    expect(screen.getByPlaceholderText('Confirm your password')).toHaveAttribute('required')
  })

  it('email input has correct type', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('prevents submission with empty fields', () => {
    render(<SignupForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />)
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    // HTML5 validation should prevent submission
    expect(AuthService.signUp).not.toHaveBeenCalled()
  })
})

