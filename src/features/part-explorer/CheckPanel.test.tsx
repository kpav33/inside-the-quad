import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { type Build, REFERENCE_BUILD } from '@/shared/domain/build-check';

import { CheckPanel } from './CheckPanel';

function renderPanel(build: Build = REFERENCE_BUILD) {
  const props = {
    build,
    onChange: vi.fn(),
    onReset: vi.fn(),
    onHighlight: vi.fn(),
    read: false,
    onClose: vi.fn(),
    onToggleRead: vi.fn(),
  };
  render(<CheckPanel {...props} />);
  return props;
}

const results = () =>
  within(screen.getByRole('list', { name: 'Results' })).getAllByRole('listitem');
const result = (name: string) => {
  const found = results().find((item) => item.textContent.includes(name));
  if (!found) throw new Error(`no result ${name}`);
  return found;
};

describe('CheckPanel', () => {
  it('heads the sheet as the one sheet of Plan a build', () => {
    renderPanel();
    expect(screen.getByRole('heading', { level: 2, name: 'Check a build' })).toBeInTheDocument();
    const block = screen.getByRole('group', { name: 'Title block' });
    expect(block).toHaveTextContent('Plan a build');
    expect(block).toHaveTextContent('1 of 1');
  });

  it('lists the seven checks in order, all fitting, with a summary', () => {
    renderPanel();
    expect(results().map((item) => item.querySelector('.check-result-name')?.textContent)).toEqual([
      'Stack mounting',
      'Camera width',
      'Motor mount',
      'Prop size',
      'Voltage',
      'Motor KV',
      'Video system',
    ]);
    for (const item of results()) expect(item).toHaveTextContent('Fits');
    expect(screen.getByText('7 fit')).toBeInTheDocument();
  });

  it('asks for the parts first, then gives the results', () => {
    renderPanel();
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(['Your parts', 'Results']);
  });

  it('keeps a live summary above the parts, announced politely when it changes', () => {
    renderPanel();
    const summary = screen.getByTestId('check-summary');
    expect(summary).toHaveAttribute('aria-live', 'polite');
    expect(summary).toHaveTextContent('7 fit');
    const parts = screen.getByRole('heading', { level: 3, name: 'Your parts' });
    const camera = screen.getByRole('group', { name: 'Camera' });
    expect(parts.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(summary.compareDocumentPosition(camera) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('takes the reader from the summary to the results', async () => {
    renderPanel();
    await userEvent.click(screen.getByRole('button', { name: 'See the results' }));
    expect(screen.getByRole('heading', { level: 3, name: 'Results' })).toHaveFocus();
  });

  it('reports a pick as a change to the build', async () => {
    const { onChange } = renderPanel();
    const camera = screen.getByRole('group', { name: 'Camera' });
    await userEvent.selectOptions(within(camera).getByLabelText('Width'), '21 mm');
    expect(onChange).toHaveBeenCalledWith({ cameraMm: 21 });
  });

  it('shows a part that does not fit, why, and the lesson that explains it', () => {
    renderPanel({ ...REFERENCE_BUILD, cameraMm: 21 });
    const camera = result('Camera width');
    expect(camera).toHaveTextContent('Doesn’t fit');
    expect(camera).toHaveTextContent(/21 mm camera is wider than the frame’s 19 mm mount/);
    expect(within(camera).getByRole('link', { name: /Frame/ })).toHaveAttribute(
      'href',
      '/parts/frame',
    );
    expect(camera).toHaveAttribute('data-status', 'fails');
    expect(screen.getByText('6 fit · 1 doesn’t')).toBeInTheDocument();
  });

  it('lights a result’s parts while it is pointed at or focused', () => {
    const { onHighlight } = renderPanel();
    const camera = result('Camera width');
    fireEvent.mouseEnter(camera);
    expect(onHighlight).toHaveBeenLastCalledWith(['frame', 'camera']);
    fireEvent.mouseLeave(camera);
    expect(onHighlight).toHaveBeenLastCalledWith(null);
    within(camera).getByRole('link').focus();
    expect(onHighlight).toHaveBeenLastCalledWith(['frame', 'camera']);
    within(camera).getByRole('link').blur();
    expect(onHighlight).toHaveBeenLastCalledWith(null);
  });

  it('treats a KV that is not a whole number in range as not entered', async () => {
    const { onChange } = renderPanel();
    const kv = screen.getByRole('textbox', { name: 'KV' });
    expect(kv).toHaveValue('1950');
    expect(kv).toHaveAccessibleDescription('A whole number, 500–5000');
    await userEvent.clear(kv);
    await userEvent.type(kv, 'abc');
    expect(onChange).toHaveBeenLastCalledWith({ kv: null });
    expect(kv).toHaveValue('abc');
    await userEvent.clear(kv);
    await userEvent.type(kv, '2400');
    expect(onChange).toHaveBeenLastCalledWith({ kv: 2400 });
  });

  it('says to enter the KV when there is none', () => {
    renderPanel({ ...REFERENCE_BUILD, kv: null });
    expect(result('Motor KV')).toHaveTextContent('Check this');
    expect(result('Motor KV')).toHaveTextContent(/Enter the motors’ KV/);
  });

  it('offers the video kinds as choices whose long names wrap rather than being cut short', async () => {
    const { onChange } = renderPanel();
    const goggles = screen.getByRole('group', { name: 'Goggles' });
    expect(within(goggles).getByRole('radio', { name: 'Analog' })).toBeChecked();
    await userEvent.click(
      within(goggles).getByRole('radio', { name: 'Digital with an analog receiver' }),
    );
    expect(onChange).toHaveBeenCalledWith({ goggles: 'digital-analog' });
    const vtx = screen.getByRole('group', { name: 'VTX' });
    await userEvent.click(within(vtx).getByRole('radio', { name: 'Digital' }));
    expect(onChange).toHaveBeenCalledWith({ vtxVideo: 'digital' });
  });

  it('resets to the app’s drone', async () => {
    const { onReset } = renderPanel({ ...REFERENCE_BUILD, cells: 4 });
    await userEvent.click(screen.getByRole('button', { name: /Reset/ }));
    expect(onReset).toHaveBeenCalled();
  });
});
