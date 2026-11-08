import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TitleBlock } from './TitleBlock';

describe('TitleBlock', () => {
  it('shows the part, its sheet, quantity and spec line', () => {
    render(<TitleBlock part="Motors" sheet="2 of 3" quantity={4} specs={['2207', '1950 KV']} />);
    const block = screen.getByRole('group', { name: 'Title block' });
    expect(block).toHaveTextContent('Motors');
    expect(block).toHaveTextContent('2 of 3');
    expect(block).toHaveTextContent('4');
    expect(block).toHaveTextContent('2207 · 1950 KV');
  });

  it('keeps each number with its unit, so the line breaks only between specs', () => {
    render(<TitleBlock part="Motors" sheet="2 of 3" quantity={4} specs={['2207', '1950 KV']} />);
    const groups = screen.getAllByText(/^(2207|1950 KV)$/);
    expect(groups).toHaveLength(2);
    for (const group of groups) expect(group).toHaveClass('title-block-nowrap');
  });
});
