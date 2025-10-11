import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

// Mock the AuthProvider at the top level
vi.mock('../../components/Auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: vi.fn(),
}));

// Mock lazy-loaded components
vi.mock('../../components/TripPlanner', () => ({
  default: () => <div>TripPlanner Component</div>,
}));

vi.mock('../../components/Destinations', () => ({
  default: () => <div>Destinations Component</div>,
}));

vi.mock('../../components/BudgetTracker', () => ({
  default: () => <div>BudgetTracker Component</div>,
}));

vi.mock('../../components/TripHistory', () => ({
  default: () => <div>TripHistory Component</div>,
}));

vi.mock('../../components/AIAssistant', () => ({
  default: () => <div>AIAssistant Component</div>,
}));

// Import useAuth after mocking
import { useAuth } from '../../components/Auth/AuthProvider';

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Mock loading state
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithGitHub: vi.fn(),
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Check for loading spinner or loading state
    expect(screen.getByText('Loading your AI platform...')).toBeInTheDocument();
  });

  it('displays Amrikyy branding when loaded', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithGitHub: vi.fn(),
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Wait for the branding to appear
    await waitFor(() => {
      expect(screen.getByText(/Amrikyy/i)).toBeInTheDocument();
    });
  });

  it('shows login form when not authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithGitHub: vi.fn(),
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check for form elements
      expect(screen.getByRole('textbox', { name: /email/i }) || screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });
  });
});
