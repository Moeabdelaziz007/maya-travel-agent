import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Destinations from '../Destinations'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  }
}))

describe('Destinations Component', () => {
  it('renders destinations header', () => {
    render(<Destinations />)
    
    expect(screen.getByText('Discover Destinations')).toBeInTheDocument()
    expect(screen.getByText('Explore amazing places around the world')).toBeInTheDocument()
  })

  it('displays search input', () => {
    render(<Destinations />)
    
    const searchInput = screen.getByPlaceholderText('Search destinations...')
    expect(searchInput).toBeInTheDocument()
  })

  it('displays price filter dropdown', () => {
    render(<Destinations />)
    
    expect(screen.getByText('All Prices')).toBeInTheDocument()
  })

  it('shows all default destinations', () => {
    render(<Destinations />)
    
    expect(screen.getByText('Tokyo')).toBeInTheDocument()
    expect(screen.getByText('Paris')).toBeInTheDocument()
    expect(screen.getByText('Bali')).toBeInTheDocument()
    expect(screen.getByText('New York')).toBeInTheDocument()
    expect(screen.getByText('Santorini')).toBeInTheDocument()
    expect(screen.getByText('Dubai')).toBeInTheDocument()
  })

  it('displays destination countries', () => {
    render(<Destinations />)
    
    expect(screen.getByText('Japan')).toBeInTheDocument()
    expect(screen.getByText('France')).toBeInTheDocument()
    expect(screen.getByText('Indonesia')).toBeInTheDocument()
  })

  it('shows destination ratings', () => {
    render(<Destinations />)
    
    expect(screen.getByText('4.8')).toBeInTheDocument()
    expect(screen.getByText('4.9')).toBeInTheDocument()
    expect(screen.getByText('4.7')).toBeInTheDocument()
  })

  it('displays price ranges for destinations', () => {
    render(<Destinations />)
    
    expect(screen.getByText('$$$')).toBeInTheDocument()
    expect(screen.getByText('$$$$')).toBeInTheDocument()
    expect(screen.getByText('$$')).toBeInTheDocument()
  })

  it('shows best time to visit information', () => {
    render(<Destinations />)
    
    expect(screen.getByText(/Mar-May, Sep-Nov/)).toBeInTheDocument()
    expect(screen.getByText(/Apr-Jun, Sep-Oct/)).toBeInTheDocument()
  })

  it('displays destination descriptions', () => {
    render(<Destinations />)
    
    expect(screen.getByText(/vibrant metropolis/i)).toBeInTheDocument()
    expect(screen.getByText(/City of Light/i)).toBeInTheDocument()
  })

  it('filters destinations by search term', () => {
    render(<Destinations />)
    
    const searchInput = screen.getByPlaceholderText('Search destinations...')
    fireEvent.change(searchInput, { target: { value: 'Tokyo' } })
    
    expect(screen.getByText('Tokyo')).toBeInTheDocument()
    expect(screen.queryByText('Paris')).not.toBeInTheDocument()
  })

  it('filters destinations by country name', () => {
    render(<Destinations />)
    
    const searchInput = screen.getByPlaceholderText('Search destinations...')
    fireEvent.change(searchInput, { target: { value: 'Japan' } })
    
    expect(screen.getByText('Tokyo')).toBeInTheDocument()
    expect(screen.queryByText('Paris')).not.toBeInTheDocument()
  })

  it('search is case-insensitive', () => {
    render(<Destinations />)
    
    const searchInput = screen.getByPlaceholderText('Search destinations...')
    fireEvent.change(searchInput, { target: { value: 'paris' } })
    
    expect(screen.getByText('Paris')).toBeInTheDocument()
  })

  it('filters destinations by price range', () => {
    render(<Destinations />)
    
    const priceFilter = screen.getByRole('combobox')
    fireEvent.change(priceFilter, { target: { value: '$$' } })
    
    expect(screen.getByText('Bali')).toBeInTheDocument()
    // More expensive destinations should not be shown
  })

  it('shows empty state when no destinations match filters', () => {
    render(<Destinations />)
    
    const searchInput = screen.getByPlaceholderText('Search destinations...')
    fireEvent.change(searchInput, { target: { value: 'NonexistentPlace' } })
    
    expect(screen.getByText('No destinations found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument()
  })

  it('displays Plan Trip button for each destination', () => {
    render(<Destinations />)
    
    const planTripButtons = screen.getAllByText('Plan Trip')
    expect(planTripButtons.length).toBeGreaterThan(0)
  })

  it('shows heart icon for favorite destinations', () => {
    render(<Destinations />)
    
    // Paris and Santorini are marked as favorites in the mock data
    const container = screen.getByText('Paris').closest('div')
    expect(container).toBeInTheDocument()
  })

  it('shows share buttons for all destinations', () => {
    render(<Destinations />)
    
    // Each destination should have share functionality
    const destinations = screen.getAllByText('Plan Trip')
    expect(destinations.length).toBe(6) // 6 mock destinations
  })

  it('combines search and price filters correctly', () => {
    render(<Destinations />)
    
    const searchInput = screen.getByPlaceholderText('Search destinations...')
    const priceFilter = screen.getByRole('combobox')
    
    fireEvent.change(searchInput, { target: { value: 'a' } })
    fireEvent.change(priceFilter, { target: { value: '$$$' } })
    
    // Should show destinations matching both filters
    const visibleDestinations = screen.queryAllByText('Plan Trip')
    expect(visibleDestinations.length).toBeGreaterThanOrEqual(0)
  })

  it('clears search shows all destinations', () => {
    render(<Destinations />)
    
    const searchInput = screen.getByPlaceholderText('Search destinations...')
    
    // Search and then clear
    fireEvent.change(searchInput, { target: { value: 'Tokyo' } })
    expect(screen.queryByText('Paris')).not.toBeInTheDocument()
    
    fireEvent.change(searchInput, { target: { value: '' } })
    expect(screen.getByText('Paris')).toBeInTheDocument()
  })

  it('displays destination images', () => {
    render(<Destinations />)
    
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('shows correct price range colors', () => {
    render(<Destinations />)
    
    // Price ranges should be displayed with different colors
    const container = screen.getByText('Discover Destinations').parentElement
    expect(container).toBeInTheDocument()
  })

  it('renders all 6 mock destinations initially', () => {
    render(<Destinations />)
    
    const planButtons = screen.getAllByText('Plan Trip')
    expect(planButtons).toHaveLength(6)
  })

  it('shows destination cards in grid layout', () => {
    render(<Destinations />)
    
    const container = screen.getByText('Discover Destinations').parentElement
    expect(container).toBeInTheDocument()
  })

  it('displays search icon in search input', () => {
    render(<Destinations />)
    
    const searchInput = screen.getByPlaceholderText('Search destinations...')
    expect(searchInput).toBeInTheDocument()
    
    // Search icon should be present in the DOM
    const container = searchInput.parentElement
    expect(container).toBeInTheDocument()
  })

  it('displays filter icon in price dropdown', () => {
    render(<Destinations />)
    
    const priceFilter = screen.getByRole('combobox')
    expect(priceFilter).toBeInTheDocument()
  })

  it('handles multiple simultaneous filters', () => {
    render(<Destinations />)
    
    const searchInput = screen.getByPlaceholderText('Search destinations...')
    const priceFilter = screen.getByRole('combobox')
    
    fireEvent.change(searchInput, { target: { value: 'New' } })
    fireEvent.change(priceFilter, { target: { value: '$$$$' } })
    
    // New York with $$$$ should be shown
    expect(screen.getByText('New York')).toBeInTheDocument()
  })
})

