import React from 'react';
import { render, screen } from '@testing-library/react';
import OrganizerDashboard from '../components/OrganizerDashboard';
import AttendeeView from '../components/AttendeeView';

describe('Organizer Dashboard Tests', () => {
  it('renders the Dashboard overview panels correctly', () => {
    // Basic mock of density array
    const MOCK_DENSITIES = [
      { zone: 'Gates', density_percentage: 23, status: 'green', current_occupancy: 500, max_capacity: 2000 },
      { zone: 'Food_Court', density_percentage: 85, status: 'red', current_occupancy: 1400, max_capacity: 1500 }
    ];
    
    render(<OrganizerDashboard densities={MOCK_DENSITIES} />);
    
    // Ensure dashboard structure renders
    expect(screen.getByText(/Command Center/i)).toBeInTheDocument();
    
    // Check if the Mock data populated
    expect(screen.getByText('Gates')).toBeInTheDocument();
  });
});

describe('Attendee Map Tests', () => {
  it('renders the Map headers correctly', () => {
    render(<AttendeeView densities={[]} apiUrl="" />);
    expect(screen.getByText(/Stadium Radar/i)).toBeInTheDocument();
  });
});
