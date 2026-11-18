import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SheetFooter } from './SheetFooter';

function renderFooter(sheet: Parameters<typeof SheetFooter>[0]['sheet']) {
  render(<SheetFooter sheet={sheet} read={false} onToggleRead={vi.fn()} />);
}

describe('SheetFooter across chapters', () => {
  it('leaves What if for the gear, naming its chapter', () => {
    renderFooter('what-if');
    expect(
      screen.getByRole('link', {
        name: 'End of How it works together: The gear you hold and wear, sheet 1: Radio',
      }),
    ).toHaveAttribute('href', '/gear/radio');
  });

  it('goes back from the radio into How it works together', () => {
    renderFooter('radio');
    expect(
      screen.getByRole('link', { name: 'Back to How it works together: What if · sheet 5' }),
    ).toHaveAttribute('href', '/what-if');
  });

  it('ends the set at the charger with the overview', () => {
    renderFooter('charger');
    expect(screen.getByRole('link', { name: 'Next: Back to overview' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
