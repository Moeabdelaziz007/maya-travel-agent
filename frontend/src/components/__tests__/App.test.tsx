import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

// Mock the AuthProvider
vi.mock('../Auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({ user: null, loading: false })
}))

describe('App Component', () => {
  it('renders loading state initially', () => {
    render(<App />)
    expect(screen.getByText('Loading your travel assistant...')).toBeInTheDocument()
  })

  it('renders login form when user is not authenticated', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByRole('form')).toBeInTheDocument()
    })
  })

  it('displays Maya Trips branding', () => {
    render(<App />)
    expect(screen.getByText('Maya Trips')).toBeInTheDocument()
  })
})
