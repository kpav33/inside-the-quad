import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LESSONS } from '@/content/lessons';

import { TitleBlock } from './TitleBlock';

describe('TitleBlock', () => {
  it('shows the part, its sheet number, quantity and key specs', () => {
    render(<TitleBlock lesson={LESSONS.motors} sheet={2} sheets={3} quantity={4} />);
    const block = screen.getByRole('group', { name: 'Title block' });
    expect(block).toHaveTextContent('Motors');
    expect(block).toHaveTextContent('2 of 3');
    expect(block).toHaveTextContent('4');
    for (const row of LESSONS.motors.specs) expect(block).toHaveTextContent(row.value);
  });
});
