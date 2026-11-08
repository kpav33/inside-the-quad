import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TitleBlock } from './TitleBlock';

const specs = [
  { label: 'Size', value: '2207' },
  { label: 'KV', value: '1950 KV' },
];

describe('TitleBlock', () => {
  it('shows the part, its sheet and quantity', () => {
    render(<TitleBlock part="Motors" sheet="2 of 3" quantity={4} specs={specs} />);
    const block = screen.getByRole('group', { name: 'Title block' });
    expect(block).toHaveTextContent('Motors');
    expect(block).toHaveTextContent('2 of 3');
    expect(block).toHaveTextContent('4');
  });

  it('names every number it shows', () => {
    render(<TitleBlock part="Motors" sheet="2 of 3" quantity={4} specs={specs} />);
    const terms = screen.getAllByRole('term').map((t) => t.textContent);
    const values = screen.getAllByRole('definition').map((d) => d.textContent);
    expect(terms).toEqual(['Size', 'KV']);
    expect(values).toEqual(['2207', '1950 KV']);
  });

  it('keeps each number with its unit', () => {
    render(<TitleBlock part="Motors" sheet="2 of 3" quantity={4} specs={specs} />);
    for (const value of screen.getAllByRole('definition')) {
      expect(value).toHaveClass('title-block-nowrap');
    }
    expect(within(screen.getByRole('group')).getAllByRole('definition')).toHaveLength(2);
  });
});
