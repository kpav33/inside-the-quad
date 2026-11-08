import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { App } from './App';

// WebGL is unavailable in jsdom, so the 3D viewer is replaced with a stub.
vi.mock('@/features/drone-viewer/DroneViewer', () => ({
  default: () => <div data-testid="drone-viewer" />,
}));

describe('App', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Inside the Quad' })).toBeInTheDocument();
  });

  it('shows the part explorer with the 3D viewer and the part list', async () => {
    render(<App />);
    expect(await screen.findByTestId('drone-viewer')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Drone parts' })).toBeInTheDocument();
  });
});
