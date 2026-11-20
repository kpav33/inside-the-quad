import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChapterSwitcher } from './ChapterSwitcher';

describe('ChapterSwitcher', () => {
  it('lists every sheet of a chapter with several', () => {
    render(<ChapterSwitcher open="goggles" />);
    expect(screen.getByRole('navigation', { name: 'The gear you hold and wear' })).toBeVisible();
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('shows nothing for a chapter of one sheet', () => {
    const { container } = render(<ChapterSwitcher open="check" />);
    expect(container).toBeEmptyDOMElement();
  });
});
