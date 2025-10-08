import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AIAssistant from '../AIAssistant'
import { aiService, analyticsService } from '../../api/services'

// Mock the services
vi.mock('../../api/services', () => ({
  aiService: {
    sendMessage: vi.fn(),
    analyzeMedia: vi.fn()
  },
  analyticsService: {
    track: vi.fn()
  }
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  }
}))

describe('AIAssistant Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the AI assistant with initial welcome message', () => {
    render(<AIAssistant />)
    
    expect(screen.getByText('Maya AI Assistant')).toBeInTheDocument()
    expect(screen.getByText(/مرحباً! أنا Maya/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ask Maya anything about your travel...')).toBeInTheDocument()
  })

  it('displays AI feature cards', () => {
    render(<AIAssistant />)
    
    expect(screen.getByText('Smart Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Safety Insights')).toBeInTheDocument()
    expect(screen.getByText('Instant Planning')).toBeInTheDocument()
  })

  it('displays initial suggestion buttons', () => {
    render(<AIAssistant />)
    
    expect(screen.getByText('أريد تخطيط رحلة إلى اليابان')).toBeInTheDocument()
    expect(screen.getByText('ما هي أفضل الأوقات للسفر إلى أوروبا؟')).toBeInTheDocument()
  })

  it('handles suggestion click by filling input', () => {
    render(<AIAssistant />)
    
    const suggestionButton = screen.getByText('أريد تخطيط رحلة إلى اليابان')
    fireEvent.click(suggestionButton)
    
    const input = screen.getByPlaceholderText('Ask Maya anything about your travel...') as HTMLInputElement
    expect(input.value).toBe('أريد تخطيط رحلة إلى اليابان')
  })

  it('updates input value when typing', () => {
    render(<AIAssistant />)
    
    const input = screen.getByPlaceholderText('Ask Maya anything about your travel...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Tell me about Tokyo' } })
    
    expect(input.value).toBe('Tell me about Tokyo')
  })

  it('sends message when send button is clicked', async () => {
    const mockResponse = {
      data: {
        success: true,
        reply: 'Tokyo is a wonderful destination!'
      }
    }
    
    vi.mocked(aiService.sendMessage).mockResolvedValue(mockResponse)
    
    render(<AIAssistant />)
    
    const input = screen.getByPlaceholderText('Ask Maya anything about your travel...')
    fireEvent.change(input, { target: { value: 'Tell me about Tokyo' } })
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(aiService.sendMessage).toHaveBeenCalledWith('Tell me about Tokyo', expect.any(Object))
    })
    
    await waitFor(() => {
      expect(screen.getByText('Tokyo is a wonderful destination!')).toBeInTheDocument()
    })
  })

  it('sends message when Enter key is pressed', async () => {
    const mockResponse = {
      data: {
        success: true,
        reply: 'I can help you with that!'
      }
    }
    
    vi.mocked(aiService.sendMessage).mockResolvedValue(mockResponse)
    
    render(<AIAssistant />)
    
    const input = screen.getByPlaceholderText('Ask Maya anything about your travel...')
    fireEvent.change(input, { target: { value: 'Help me plan' } })
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 })
    
    await waitFor(() => {
      expect(aiService.sendMessage).toHaveBeenCalled()
    })
  })

  it('shows typing indicator while waiting for response', async () => {
    const mockResponse = {
      data: {
        success: true,
        reply: 'Here is your answer!'
      }
    }
    
    vi.mocked(aiService.sendMessage).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    )
    
    render(<AIAssistant />)
    
    const input = screen.getByPlaceholderText('Ask Maya anything about your travel...')
    fireEvent.change(input, { target: { value: 'Test message' } })
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('Maya is typing...')).toBeInTheDocument()
    })
  })

  it('displays error message when API call fails', async () => {
    vi.mocked(aiService.sendMessage).mockRejectedValue(new Error('API Error'))
    
    render(<AIAssistant />)
    
    const input = screen.getByPlaceholderText('Ask Maya anything about your travel...')
    fireEvent.change(input, { target: { value: 'Test message' } })
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/عذراً، حدث خطأ في الاتصال/)).toBeInTheDocument()
    })
  })

  it('toggles voice listening state', () => {
    render(<AIAssistant />)
    
    const micButton = screen.getAllByRole('button')[0] // First button is mic
    expect(micButton).toBeInTheDocument()
    
    fireEvent.click(micButton)
    // Voice listening toggle should work (visual state change)
  })

  it('prevents sending empty messages', () => {
    render(<AIAssistant />)
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    expect(sendButton).toBeDisabled()
  })

  it('clears input after sending message', async () => {
    const mockResponse = {
      data: {
        success: true,
        reply: 'Response received'
      }
    }
    
    vi.mocked(aiService.sendMessage).mockResolvedValue(mockResponse)
    
    render(<AIAssistant />)
    
    const input = screen.getByPlaceholderText('Ask Maya anything about your travel...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Test message' } })
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })

  it('handles media analysis', async () => {
    const mockResponse = {
      data: {
        analysis: 'This is a beautiful beach destination!'
      }
    }
    
    vi.mocked(aiService.analyzeMedia).mockResolvedValue(mockResponse)
    
    render(<AIAssistant />)
    
    const imageInput = screen.getByPlaceholderText('Image URL (optional)')
    fireEvent.change(imageInput, { target: { value: 'https://example.com/image.jpg' } })
    
    const analyzeButton = screen.getByText('Analyze Media')
    fireEvent.click(analyzeButton)
    
    await waitFor(() => {
      expect(aiService.analyzeMedia).toHaveBeenCalled()
    })
    
    await waitFor(() => {
      expect(screen.getByText('This is a beautiful beach destination!')).toBeInTheDocument()
    })
  })

  it('disables analyze button when no media URL is provided', () => {
    render(<AIAssistant />)
    
    const analyzeButton = screen.getByText('Analyze Media')
    expect(analyzeButton).toBeDisabled()
  })

  it('shows analyzing state during media analysis', async () => {
    const mockResponse = {
      data: {
        analysis: 'Analysis complete'
      }
    }
    
    vi.mocked(aiService.analyzeMedia).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    )
    
    render(<AIAssistant />)
    
    const imageInput = screen.getByPlaceholderText('Image URL (optional)')
    fireEvent.change(imageInput, { target: { value: 'https://example.com/image.jpg' } })
    
    const analyzeButton = screen.getByText('Analyze Media')
    fireEvent.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Analyzing…')).toBeInTheDocument()
    })
  })

  it('handles media analysis error gracefully', async () => {
    vi.mocked(aiService.analyzeMedia).mockRejectedValue(new Error('Analysis failed'))
    
    render(<AIAssistant />)
    
    const imageInput = screen.getByPlaceholderText('Image URL (optional)')
    fireEvent.change(imageInput, { target: { value: 'https://example.com/image.jpg' } })
    
    const analyzeButton = screen.getByText('Analyze Media')
    fireEvent.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to analyze media.')).toBeInTheDocument()
    })
  })

  it('tracks analytics events on message send', async () => {
    const mockResponse = {
      data: {
        success: true,
        reply: 'Response'
      }
    }
    
    vi.mocked(aiService.sendMessage).mockResolvedValue(mockResponse)
    
    render(<AIAssistant />)
    
    const input = screen.getByPlaceholderText('Ask Maya anything about your travel...')
    fireEvent.change(input, { target: { value: 'Test' } })
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(analyticsService.track).toHaveBeenCalled()
    })
  })
})

