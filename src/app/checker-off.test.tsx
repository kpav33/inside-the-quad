import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// WebGL is unavailable in jsdom, so the 3D viewer is replaced with a stub.
vi.mock('@/features/drone-viewer/DroneViewer', () => ({
  default: () => <div data-testid="drone-viewer" />,
}));

/**
 * Check a build is held back from the release: with its switch off (the default for a build),
 * the app is as it was before section 07. The other tests run with the switch on.
 */
describe('with Check a build switched off', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_FEATURE_CHECKER', 'false');
    vi.resetModules();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    window.localStorage.clear();
  });

  it('leaves it out of the sheets: the Charger ends the set', async () => {
    const { NUMBERED_SHEETS, CHAPTER_SHEETS, sheetNeighbours } =
      await import('@/shared/domain/sheets');
    expect(NUMBERED_SHEETS).not.toContain('check');
    expect(CHAPTER_SHEETS.build).toEqual([]);
    expect(sheetNeighbours('charger').next).toBeNull();
  });

  it('treats /check as an address the app does not know', async () => {
    const { parseRoute } = await import('@/shared/routing');
    expect(parseRoute('/check')).toEqual({ kind: 'unknown', slug: '/check' });
  });

  it('shows the overview for /check, with no masthead link and no Build count', async () => {
    window.localStorage.setItem('inside-the-quad.read-parts.v1', '["frame"]');
    window.history.replaceState(null, '', '/check?camera=21');
    const { App } = await import('./App');
    render(<App />);
    await screen.findByTestId('drone-viewer');
    const nav = screen.getByRole('navigation', { name: 'Sections' });
    expect(within(nav).getAllByRole('link')).toHaveLength(3);
    expect(screen.queryByRole('heading', { level: 2, name: 'Check a build' })).toBeNull();
    expect(screen.getByText(/There’s no part called/)).toBeInTheDocument();
    expect(
      screen.getByText('Parts 1 of 11 · How it works 0 of 5 · Gear 0 of 3'),
    ).toBeInTheDocument();
    expect(window.location.pathname + window.location.search).toBe('/');
  });
});
