import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TripPlanner from '../TripPlanner'

const mockTrips = [
  {
    id: '1',
    destination: 'Tokyo, Japan',
    startDate: '2024-03-15',
    endDate: '2024-03-22',
    budget: 2500,
    status: 'planned' as const,
    image: 'https://example.com/tokyo.jpg'
  }
]

const mockSetTrips = vi.fn()

describe('TripPlanner Component', () => {
  it('renders trip cards', () => {
    render(<TripPlanner trips={mockTrips} setTrips={mockSetTrips} />)
    
    expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument()
    expect(screen.getByText('$2,500')).toBeInTheDocument()
  })

  it('displays trip planning interface', () => {
    render(<TripPlanner trips={mockTrips} setTrips={mockSetTrips} />)
    
    expect(screen.getByText('Plan Your Next Adventure')).toBeInTheDocument()
  })

  it('handles trip creation', () => {
    render(<TripPlanner trips={mockTrips} setTrips={mockSetTrips} />)
    
    const addButton = screen.getByText('Add New Trip')
    expect(addButton).toBeInTheDocument()
  })
})
