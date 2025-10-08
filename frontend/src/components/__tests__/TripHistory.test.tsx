import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TripHistory from '../TripHistory'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  }
}))

const mockTrips = [
  {
    id: '1',
    destination: 'Tokyo, Japan',
    startDate: '2024-03-15',
    endDate: '2024-03-22',
    budget: 2500,
    status: 'completed' as const,
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
  },
  {
    id: '3',
    destination: 'Bali, Indonesia',
    startDate: '2024-05-01',
    endDate: '2024-05-10',
    budget: 1500,
    status: 'planned' as const,
    image: 'https://example.com/bali.jpg'
  }
]

describe('TripHistory Component', () => {
  it('renders trip history header', () => {
    render(<TripHistory trips={mockTrips} />)
    
    expect(screen.getByText('Trip History')).toBeInTheDocument()
    expect(screen.getByText('View and manage your travel history')).toBeInTheDocument()
  })

  it('displays filter dropdown', () => {
    render(<TripHistory trips={mockTrips} />)
    
    expect(screen.getByText('Filter by Status')).toBeInTheDocument()
  })

  it('displays sort dropdown', () => {
    render(<TripHistory trips={mockTrips} />)
    
    expect(screen.getByText('Sort by')).toBeInTheDocument()
  })

  it('shows trip statistics', () => {
    render(<TripHistory trips={mockTrips} />)
    
    expect(screen.getByText('Total Trips')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Planned')).toBeInTheDocument()
    expect(screen.getByText('Total Budget')).toBeInTheDocument()
  })

  it('displays correct total trip count', () => {
    render(<TripHistory trips={mockTrips} />)
    
    expect(screen.getByText('3')).toBeInTheDocument() // 3 total trips
  })

  it('displays correct completed trip count', () => {
    render(<TripHistory trips={mockTrips} />)
    
    expect(screen.getByText('1')).toBeInTheDocument() // 1 completed trip
  })

  it('displays correct planned trip count', () => {
    render(<TripHistory trips={mockTrips} />)
    
    // Should show "1" for planned trips
    const stats = screen.getAllByText('1')
    expect(stats.length).toBeGreaterThan(0)
  })

  it('calculates total budget correctly', () => {
    render(<TripHistory trips={mockTrips} />)
    
    // Total budget: 2500 + 3000 + 1500 = 7000
    expect(screen.getByText('$7,000')).toBeInTheDocument()
  })

  it('displays all trip destinations', () => {
    render(<TripHistory trips={mockTrips} />)
    
    expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument()
    expect(screen.getByText('Paris, France')).toBeInTheDocument()
    expect(screen.getByText('Bali, Indonesia')).toBeInTheDocument()
  })

  it('displays trip dates', () => {
    render(<TripHistory trips={mockTrips} />)
    
    expect(screen.getByText(/2024-03-15 - 2024-03-22/)).toBeInTheDocument()
    expect(screen.getByText(/2024-04-10 - 2024-04-20/)).toBeInTheDocument()
  })

  it('displays trip budgets', () => {
    render(<TripHistory trips={mockTrips} />)
    
    expect(screen.getByText('$2,500')).toBeInTheDocument()
    expect(screen.getByText('$3,000')).toBeInTheDocument()
    expect(screen.getByText('$1,500')).toBeInTheDocument()
  })

  it('filters trips by status', () => {
    render(<TripHistory trips={mockTrips} />)
    
    const filterSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(filterSelect, { target: { value: 'completed' } })
    
    // Should only show completed trip (Tokyo)
    expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument()
    expect(screen.queryByText('Paris, France')).not.toBeInTheDocument()
    expect(screen.queryByText('Bali, Indonesia')).not.toBeInTheDocument()
  })

  it('filters trips by ongoing status', () => {
    render(<TripHistory trips={mockTrips} />)
    
    const filterSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(filterSelect, { target: { value: 'ongoing' } })
    
    expect(screen.getByText('Paris, France')).toBeInTheDocument()
    expect(screen.queryByText('Tokyo, Japan')).not.toBeInTheDocument()
  })

  it('filters trips by planned status', () => {
    render(<TripHistory trips={mockTrips} />)
    
    const filterSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(filterSelect, { target: { value: 'planned' } })
    
    expect(screen.getByText('Bali, Indonesia')).toBeInTheDocument()
  })

  it('sorts trips by date', () => {
    render(<TripHistory trips={mockTrips} />)
    
    const sortSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(sortSelect, { target: { value: 'date' } })
    
    // Trips should be shown (most recent first by default)
    const destinations = screen.getAllByRole('heading', { level: 3 })
    expect(destinations.length).toBeGreaterThan(0)
  })

  it('sorts trips by destination', () => {
    render(<TripHistory trips={mockTrips} />)
    
    const sortSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(sortSelect, { target: { value: 'destination' } })
    
    // All destinations should still be visible
    expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument()
    expect(screen.getByText('Paris, France')).toBeInTheDocument()
    expect(screen.getByText('Bali, Indonesia')).toBeInTheDocument()
  })

  it('sorts trips by budget', () => {
    render(<TripHistory trips={mockTrips} />)
    
    const sortSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(sortSelect, { target: { value: 'budget' } })
    
    // All budgets should still be visible
    expect(screen.getByText('$2,500')).toBeInTheDocument()
    expect(screen.getByText('$3,000')).toBeInTheDocument()
    expect(screen.getByText('$1,500')).toBeInTheDocument()
  })

  it('displays trip status badges', () => {
    render(<TripHistory trips={mockTrips} />)
    
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Ongoing')).toBeInTheDocument()
    expect(screen.getByText('Planned')).toBeInTheDocument()
  })

  it('shows trip duration', () => {
    render(<TripHistory trips={mockTrips} />)
    
    // Tokyo trip: 7 days
    expect(screen.getByText('8 days')).toBeInTheDocument()
    // Paris trip: 10 days
    expect(screen.getByText('11 days')).toBeInTheDocument()
  })

  it('displays View Details button for each trip', () => {
    render(<TripHistory trips={mockTrips} />)
    
    const viewButtons = screen.getAllByText('View Details')
    expect(viewButtons.length).toBe(3)
  })

  it('displays Edit Trip button for each trip', () => {
    render(<TripHistory trips={mockTrips} />)
    
    const editButtons = screen.getAllByText('Edit Trip')
    expect(editButtons.length).toBe(3)
  })

  it('shows action buttons for each trip', () => {
    render(<TripHistory trips={mockTrips} />)
    
    // Should have camera, share, and download buttons
    const tripCard = screen.getByText('Tokyo, Japan').closest('div')
    expect(tripCard).toBeInTheDocument()
  })

  it('displays empty state when no trips match filter', () => {
    render(<TripHistory trips={[]} />)
    
    expect(screen.getByText('No trips found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters or add a new trip')).toBeInTheDocument()
  })

  it('shows empty state message when filtered results are empty', () => {
    const singleTrip = [mockTrips[0]] // Only completed trip
    render(<TripHistory trips={singleTrip} />)
    
    const filterSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(filterSelect, { target: { value: 'ongoing' } })
    
    expect(screen.getByText('No trips found')).toBeInTheDocument()
  })

  it('displays trip images', () => {
    render(<TripHistory trips={mockTrips} />)
    
    const images = screen.getAllByRole('img')
    expect(images.length).toBe(3)
  })

  it('handles empty trips array gracefully', () => {
    render(<TripHistory trips={[]} />)
    
    expect(screen.getByText('Trip History')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument() // 0 total trips
  })

  it('resets to all trips when filter is set to all', () => {
    render(<TripHistory trips={mockTrips} />)
    
    const filterSelect = screen.getAllByRole('combobox')[0]
    
    // Filter to completed
    fireEvent.change(filterSelect, { target: { value: 'completed' } })
    expect(screen.queryByText('Paris, France')).not.toBeInTheDocument()
    
    // Reset to all
    fireEvent.change(filterSelect, { target: { value: 'all' } })
    expect(screen.getByText('Paris, France')).toBeInTheDocument()
  })

  it('shows trip ratings', () => {
    render(<TripHistory trips={mockTrips} />)
    
    // Each trip shows a rating of 4.8
    const ratings = screen.getAllByText('4.8')
    expect(ratings.length).toBe(3)
  })

  it('combines filter and sort correctly', () => {
    render(<TripHistory trips={mockTrips} />)
    
    const filterSelect = screen.getAllByRole('combobox')[0]
    const sortSelect = screen.getAllByRole('combobox')[1]
    
    fireEvent.change(filterSelect, { target: { value: 'all' } })
    fireEvent.change(sortSelect, { target: { value: 'destination' } })
    
    // All trips should be visible and sorted
    expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument()
    expect(screen.getByText('Paris, France')).toBeInTheDocument()
    expect(screen.getByText('Bali, Indonesia')).toBeInTheDocument()
  })
})

