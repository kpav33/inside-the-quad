import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PartLink } from './PartLink';

function renderLink() {
  window.history.replaceState(null, '', '/parts/esc');
  render(<PartLink to="battery">Battery</PartLink>);
  return screen.getByRole('link', { name: 'Battery' });
}

describe('PartLink', () => {
  it('links to the part’s address', () => {
    expect(renderLink()).toHaveAttribute('href', '/parts/battery');
  });

  it('links to the overview for null', () => {
    render(<PartLink to={null}>Back</PartLink>);
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/');
  });

  it('navigates in place on a plain click', () => {
    fireEvent.click(renderLink());
    expect(window.location.pathname).toBe('/parts/battery');
  });

  it('leaves a Ctrl click to the browser', () => {
    fireEvent.click(renderLink(), { ctrlKey: true });
    expect(window.location.pathname).toBe('/parts/esc');
  });

  it('leaves a middle click to the browser', () => {
    fireEvent.click(renderLink(), { button: 1 });
    expect(window.location.pathname).toBe('/parts/esc');
  });
});
