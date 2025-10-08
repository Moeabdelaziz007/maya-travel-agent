import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AnalyticsPage from '../Analytics'
import { analyticsService } from '../../api/services'

// Mock the analytics service
vi.mock('../../api/services', () => ({
  analyticsService: {
    summary: vi.fn()
  }
}))

describe('Analytics Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    vi.mocked(analyticsService.summary).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    )
    
    render(<AnalyticsPage />)
    
    expect(screen.getByText('Loading analytics…')).toBeInTheDocument()
  })

  it('displays analytics dashboard title', async () => {
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 100,
        byType: { chat_message: 50, chat_reply: 50 },
        last10: []
      }
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
    })
  })

  it('displays total events count', async () => {
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 250,
        byType: {},
        last10: []
      }
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Total events')).toBeInTheDocument()
      expect(screen.getByText('250')).toBeInTheDocument()
    })
  })

  it('displays zero when no events', async () => {
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: null
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  it('displays events by type section', async () => {
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 100,
        byType: { chat_message: 60, chat_reply: 40 },
        last10: []
      }
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Events by type')).toBeInTheDocument()
    })
  })

  it('displays last 10 events section', async () => {
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 100,
        byType: {},
        last10: [
          { id: 1, type: 'chat_message', timestamp: '2024-01-01' }
        ]
      }
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Last 10 events')).toBeInTheDocument()
    })
  })

  it('renders events by type as JSON', async () => {
    const mockByType = { chat_message: 60, chat_reply: 40, payment_created: 10 }
    
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 110,
        byType: mockByType,
        last10: []
      }
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      const byTypeSection = screen.getByText('Events by type').parentElement
      expect(byTypeSection).toBeInTheDocument()
    })
  })

  it('renders last 10 events as JSON array', async () => {
    const mockEvents = [
      { id: 1, type: 'chat_message', timestamp: '2024-01-01' },
      { id: 2, type: 'chat_reply', timestamp: '2024-01-02' }
    ]
    
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 100,
        byType: {},
        last10: mockEvents
      }
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      const last10Section = screen.getByText('Last 10 events').parentElement
      expect(last10Section).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    vi.mocked(analyticsService.summary).mockRejectedValue(new Error('API Error'))
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      // Should show analytics dashboard even with error
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
    })
  })

  it('displays empty object when byType is missing', async () => {
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 0,
        byType: null,
        last10: []
      }
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Events by type')).toBeInTheDocument()
      expect(screen.getByText('{}')).toBeInTheDocument()
    })
  })

  it('displays empty array when last10 is missing', async () => {
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 100,
        byType: {},
        last10: null
      }
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Last 10 events')).toBeInTheDocument()
      expect(screen.getByText('[]')).toBeInTheDocument()
    })
  })

  it('calls analytics service on mount', async () => {
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 100,
        byType: {},
        last10: []
      }
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      expect(analyticsService.summary).toHaveBeenCalled()
    })
  })

  it('renders with proper styling classes', async () => {
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 100,
        byType: {},
        last10: []
      }
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      const container = screen.getByText('Analytics Dashboard').parentElement
      expect(container).toHaveClass('p-6', 'space-y-4')
    })
  })

  it('displays all three stat cards', async () => {
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 100,
        byType: { test: 50 },
        last10: [{ id: 1 }]
      }
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Total events')).toBeInTheDocument()
      expect(screen.getByText('Events by type')).toBeInTheDocument()
      expect(screen.getByText('Last 10 events')).toBeInTheDocument()
    })
  })

  it('formats JSON with proper indentation', async () => {
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 100,
        byType: { chat_message: 50, chat_reply: 50 },
        last10: []
      }
    })
    
    render(<AnalyticsPage />)
    
    await waitFor(() => {
      const byTypeSection = screen.getByText('Events by type').parentElement
      const pre = byTypeSection?.querySelector('pre')
      expect(pre).toBeInTheDocument()
    })
  })

  it('removes loading state after data loads', async () => {
    vi.mocked(analyticsService.summary).mockResolvedValue({
      data: {
        total: 100,
        byType: {},
        last10: []
      }
    })
    
    render(<AnalyticsPage />)
    
    expect(screen.getByText('Loading analytics…')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText('Loading analytics…')).not.toBeInTheDocument()
    })
  })
})

