import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { PartPhoto as Photo } from '@/content/photos';

import { PartPhoto } from './PartPhoto';

const photo: Photo = {
  src: '/assets/esc-640.webp',
  srcLarge: '/assets/esc-1280.webp',
  width: 1024,
  height: 320,
  alt: 'A small ESC wrapped in blue shrink tube.',
  caption: 'One example: a single ESC, one per motor.',
  credit: {
    author: '1sfoerster',
    licence: 'CC BY-SA 3.0',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Esc2.jpg',
    cropped: true,
  },
};

describe('PartPhoto', () => {
  it('shows the image at its own size, so the page does not jump while it loads', () => {
    render(<PartPhoto photo={photo} />);
    const image = screen.getByRole('img', { name: photo.alt });
    expect(image).toHaveAttribute('width', '1024');
    expect(image).toHaveAttribute('height', '320');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image.getAttribute('srcset')).toBe(
      '/assets/esc-640.webp 640w, /assets/esc-1280.webp 1280w',
    );
  });

  it('captions it as one example and credits it with links', () => {
    render(<PartPhoto photo={photo} />);
    expect(screen.getByText(photo.caption)).toBeInTheDocument();
    expect(screen.getByText(/1sfoerster/)).toHaveTextContent(/cropped/i);
    const licence = screen.getByRole('link', { name: 'CC BY-SA 3.0' });
    expect(licence).toHaveAttribute('href', photo.credit.licenceUrl);
    const source = screen.getByRole('link', { name: 'Wikimedia Commons' });
    expect(source).toHaveAttribute('href', photo.credit.sourceUrl);
    for (const link of [licence, source]) expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('names a public-domain photo without a licence link, and an uncropped one without "cropped"', () => {
    const { licenceUrl: _unused, ...credit } = photo.credit;
    render(
      <PartPhoto
        photo={{ ...photo, credit: { ...credit, licence: 'Public domain', cropped: false } }}
      />,
    );
    expect(screen.queryByRole('link', { name: 'Public domain' })).toBeNull();
    expect(screen.getByText(/Public domain/)).toBeInTheDocument();
    expect(screen.getByText(/1sfoerster/)).not.toHaveTextContent(/cropped/i);
  });
});
