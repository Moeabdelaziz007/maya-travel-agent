import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../../App';

describe('App Component', () => {
  it('renders loading state initially', () => {
    // Mock the AuthProvider with loading true
    vi.mock('../Auth/AuthProvider', () => ({
      AuthProvider: ({ children }: { children: React.ReactNode }) => children,
      useAuth: () => ({ user: null, loading: true }),
    }));

    render(<App />);
    expect(
      screen.getByText('Loading your AI platform...')
    ).toBeInTheDocument();
  });

  it('displays Amrikyy branding', () => {
    // Mock the AuthProvider with loading true
    vi.mock('../Auth/AuthProvider', () => ({
      AuthProvider: ({ children }: { children: React.ReactNode }) => children,
      useAuth: () => ({ user: null, loading: true }),
    }));

    render(<App />);
    expect(screen.getByText('Amrikyy')).toBeInTheDocument();
  });
});
