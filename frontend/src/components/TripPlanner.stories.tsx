import type { Meta, StoryObj } from '@storybook/react';
import TripPlanner from './TripPlanner';
import { fn } from '@storybook/test';

// Mock data for stories
const mockTrips = [
  {
    id: '1',
    destination: 'Paris, France',
    startDate: '2025-06-15',
    endDate: '2025-06-22',
    budget: 2500,
    status: 'planned' as const,
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
  },
  {
    id: '2',
    destination: 'Tokyo, Japan',
    startDate: '2025-08-10',
    endDate: '2025-08-18',
    budget: 3200,
    status: 'ongoing' as const,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
  },
  {
    id: '3',
    destination: 'Bali, Indonesia',
    startDate: '2025-03-01',
    endDate: '2025-03-08',
    budget: 1800,
    status: 'completed' as const,
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400',
  },
];

const meta: Meta<typeof TripPlanner> = {
  title: 'Components/TripPlanner',
  component: TripPlanner,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive trip planning component that allows users to add, view, and manage their travel plans with AI-powered media analysis.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    trips: {
      control: 'object',
      description: 'Array of trip objects to display',
    },
    setTrips: {
      action: 'setTrips',
      description: 'Function to update trips state',
    },
  },
  args: {
    setTrips: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with empty trips
export const Empty: Story = {
  args: {
    trips: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state showing when no trips are planned yet.',
      },
    },
  },
};

// Story with sample trips
export const WithTrips: Story = {
  args: {
    trips: mockTrips,
  },
  parameters: {
    docs: {
      description: {
        story: 'Trip planner with multiple trips in different statuses.',
      },
    },
  },
};

// Story showing add trip form
export const AddTripForm: Story = {
  args: {
    trips: mockTrips,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the add trip form expanded.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Click the "Add Trip" button to show the form
    const addButton = canvasElement.querySelector('button:has-text("Add Trip")');
    if (addButton) {
      addButton.click();
    }
  },
};

// Story with many trips to test grid layout
export const ManyTrips: Story = {
  args: {
    trips: [
      ...mockTrips,
      {
        id: '4',
        destination: 'New York, USA',
        startDate: '2025-09-05',
        endDate: '2025-09-12',
        budget: 2800,
        status: 'planned' as const,
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
      },
      {
        id: '5',
        destination: 'Sydney, Australia',
        startDate: '2025-11-20',
        endDate: '2025-11-28',
        budget: 3500,
        status: 'planned' as const,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      },
      {
        id: '6',
        destination: 'Rome, Italy',
        startDate: '2025-07-10',
        endDate: '2025-07-17',
        budget: 2200,
        status: 'ongoing' as const,
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how the component handles multiple trips with responsive grid layout.',
      },
    },
  },
};

// Story demonstrating different trip statuses
export const TripStatuses: Story = {
  args: {
    trips: [
      {
        id: 'planned',
        destination: 'Barcelona, Spain',
        startDate: '2025-10-01',
        endDate: '2025-10-08',
        budget: 2000,
        status: 'planned' as const,
        image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400',
      },
      {
        id: 'ongoing',
        destination: 'Amsterdam, Netherlands',
        startDate: '2025-05-15',
        endDate: '2025-05-22',
        budget: 1900,
        status: 'ongoing' as const,
        image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
      },
      {
        id: 'completed',
        destination: 'Prague, Czech Republic',
        startDate: '2025-04-01',
        endDate: '2025-04-08',
        budget: 1600,
        status: 'completed' as const,
        image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the different status indicators and color coding for trip states.',
      },
    },
  },
};