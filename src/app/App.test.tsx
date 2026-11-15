import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('links the intro from the masthead, marked current while it is open', async () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Sections' });
    const link = within(nav).getByRole('link', { name: 'What is an FPV drone?' });
    expect(link).toHaveAttribute('href', '/intro');
    expect(link).not.toHaveAttribute('aria-current');
    await userEvent.click(link);
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { level: 2, name: 'What is an FPV drone?' })).toHaveFocus();
  });

  it('links the paths from the masthead, current on any path sheet', async () => {
    window.history.replaceState(null, '', '/');
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Sections' });
    const link = within(nav).getByRole('link', { name: 'How it works together' });
    expect(link).toHaveAttribute('href', '/paths/control');
    await userEvent.click(link);
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { level: 2, name: 'Control path' })).toHaveFocus();
  });

  it('marks How it works together current on the moves sheet', () => {
    window.history.replaceState(null, '', '/moves');
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Sections' });
    const link = within(nav).getByRole('link', { name: 'How it works together' });
    expect(link).toHaveAttribute('aria-current', 'page');
  });
});
