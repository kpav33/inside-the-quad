import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { INTRO } from '@/content/intro';

import { SizeComparison } from './SizeComparison';

describe('SizeComparison', () => {
  it('hides the drawing from assistive technology', () => {
    const { container } = render(<SizeComparison />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('lists every size with its prop and frame range', () => {
    render(<SizeComparison />);
    const table = screen.getByRole('table', { name: INTRO.sizes.label });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows.map((r) => [...r.children].map((c) => c.textContent))).toEqual([
      ['Tiny whoop', '31–40 mm', '65–75 mm'],
      ['3‑inch', '76 mm', '120–150 mm'],
      ['5‑inch', '127 mm', '220–230 mm'],
      ['7‑inch', '178 mm', '280–320 mm'],
    ]);
  });

  it('draws the four drones to one scale, smallest first', () => {
    const { container } = render(<SizeComparison />);
    const sizes = [...container.querySelectorAll('[data-size]')].map((el) =>
      Number(el.getAttribute('data-size')),
    );
    expect(sizes).toHaveLength(4);
    sizes.slice(1).forEach((size, i) => {
      expect(size).toBeGreaterThan(sizes[i] ?? Infinity);
    });
  });
});
