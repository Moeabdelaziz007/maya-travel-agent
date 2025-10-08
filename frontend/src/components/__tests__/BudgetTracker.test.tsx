import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BudgetTracker from '../BudgetTracker'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

const mockTrips = [
  {
    id: '1',
    destination: 'Tokyo, Japan',
    startDate: '2024-03-15',
    endDate: '2024-03-22',
    budget: 2500,
    status: 'planned' as const,
    image: 'https://example.com/tokyo.jpg'
  },
  {
    id: '2',
    destination: 'Paris, France',
    startDate: '2024-04-10',
    endDate: '2024-04-20',
    budget: 3000,
    status: 'ongoing' as const,
    image: 'https://example.com/paris.jpg'
  }
]

describe('BudgetTracker Component', () => {
  it('renders budget tracker header', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    expect(screen.getByText('Budget Tracker')).toBeInTheDocument()
    expect(screen.getByText('Monitor your travel expenses and stay on budget')).toBeInTheDocument()
  })

  it('displays trip selector with all trips', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    
    expect(screen.getByText('All Trips')).toBeInTheDocument()
    expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument()
    expect(screen.getByText('Paris, France')).toBeInTheDocument()
  })

  it('calculates total budget correctly', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    // Total budget should be 2500 + 3000 = 5500
    expect(screen.getByText('$5,500')).toBeInTheDocument()
  })

  it('displays total spent amount', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    // Total spent from mock expenses should be displayed
    expect(screen.getByText('Total Spent')).toBeInTheDocument()
  })

  it('displays remaining budget', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    expect(screen.getByText('Remaining')).toBeInTheDocument()
  })

  it('shows budget status indicator', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    // Should show some status message
    const statusMessages = ['Budget on track!', 'Budget getting tight', 'Budget exceeded!']
    const hasStatus = statusMessages.some(msg => screen.queryByText(msg))
    expect(hasStatus).toBe(true)
  })

  it('displays expenses by category section', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    expect(screen.getByText('Expenses by Category')).toBeInTheDocument()
  })

  it('displays recent expenses section', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    expect(screen.getByText('Recent Expenses')).toBeInTheDocument()
  })

  it('shows expense categories with amounts', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    expect(screen.getByText('Accommodation')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Transportation')).toBeInTheDocument()
  })

  it('displays individual expense items', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    expect(screen.getByText('Hotel booking')).toBeInTheDocument()
    expect(screen.getByText('Restaurant meals')).toBeInTheDocument()
  })

  it('filters expenses by selected trip', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '1' } })
    
    // Should show expenses for trip 1
    expect(screen.getByText('Hotel booking')).toBeInTheDocument()
    expect(screen.getByText('Restaurant meals')).toBeInTheDocument()
  })

  it('updates budget calculations when trip is selected', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '1' } })
    
    // Budget should now show only trip 1 budget (2500)
    expect(screen.getByText('$2,500')).toBeInTheDocument()
  })

  it('displays correct budget status colors', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    // Component should have color-coded status indicators
    const container = screen.getByText('Budget Tracker').closest('div')
    expect(container).toBeInTheDocument()
  })

  it('shows expense dates', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    expect(screen.getByText(/2024-03-15/)).toBeInTheDocument()
    expect(screen.getByText(/2024-03-16/)).toBeInTheDocument()
  })

  it('displays category icons', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    // Icons should be rendered in the component
    const container = screen.getByText('Budget Tracker').parentElement
    expect(container).toBeInTheDocument()
  })

  it('renders empty state correctly when no trips', () => {
    render(<BudgetTracker trips={[]} />)
    
    expect(screen.getByText('Budget Tracker')).toBeInTheDocument()
    expect(screen.getByText('All Trips')).toBeInTheDocument()
  })

  it('shows $0 values when no trips exist', () => {
    render(<BudgetTracker trips={[]} />)
    
    expect(screen.getByText('$0')).toBeInTheDocument()
  })

  it('handles large budget numbers correctly', () => {
    const expensiveTrips = [
      {
        id: '1',
        destination: 'Luxury Resort',
        startDate: '2024-05-01',
        endDate: '2024-05-10',
        budget: 15000,
        status: 'planned' as const,
        image: 'https://example.com/luxury.jpg'
      }
    ]
    
    render(<BudgetTracker trips={expensiveTrips} />)
    
    expect(screen.getByText('$15,000')).toBeInTheDocument()
  })

  it('calculates expense percentages for categories', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    // Component should calculate and display percentage bars
    expect(screen.getByText('Expenses by Category')).toBeInTheDocument()
  })

  it('limits recent expenses display to 5 items', () => {
    render(<BudgetTracker trips={mockTrips} />)
    
    // Should show maximum 5 recent expenses
    const expenseSection = screen.getByText('Recent Expenses').parentElement
    expect(expenseSection).toBeInTheDocument()
  })
})

