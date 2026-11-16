import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FlightStatus } from './FlightStatus';
import { createFlight } from './store';

describe('FlightStatus', () => {
  it('shows the link and the battery', () => {
    render(<FlightStatus flight={createFlight()} />);
    expect(screen.getByTestId('flight-status')).toHaveTextContent('Link OK · 6S');
  });

  it('says when the link is lost and the battery is 4S, the lost link marked', () => {
    const flight = createFlight();
    render(<FlightStatus flight={flight} />);
    act(() => {
      flight.setFaults({ linkLost: true, cells: 4 });
    });
    expect(screen.getByTestId('flight-status')).toHaveTextContent('Link lost · 4S');
    expect(screen.getByText('Link lost')).toHaveAttribute('data-alert', 'true');
  });

  it('names the VTX heat as it climbs, Damaged marked', () => {
    const flight = createFlight();
    render(<FlightStatus flight={flight} />);
    act(() => {
      flight.setFaults({ vtxNoAntenna: true });
      for (let i = 0; i < 140; i++) flight.advance(0.1);
    });
    expect(screen.getByText('VTX: Damaged')).toHaveAttribute('data-alert', 'true');
  });

  it('tells assistive technology what happens: disarmed, on the ground, heat, reset', () => {
    const flight = createFlight();
    render(<FlightStatus flight={flight} />);
    const said = () => screen.getByTestId('flight-announcer').textContent;
    act(() => {
      flight.setFaults({ linkLost: true });
    });
    expect(said()).toMatch(/link lost/i);
    act(() => {
      for (let i = 0; i < 30; i++) flight.advance(0.1);
    });
    expect(said()).toMatch(/ground/i);
    act(() => {
      flight.reset();
    });
    expect(said()).toMatch(/reset/i);
    act(() => {
      flight.setFaults({ vtxNoAntenna: true });
      for (let i = 0; i < 100; i++) flight.advance(0.1);
    });
    expect(said()).toMatch(/VTX: Hot/);
  });
});
