import { describe, expect, it } from 'vitest';

import { PART_IDS, type PartId } from '@/shared/domain/parts';

import manifest from '../../../scripts/photos/manifest.json';

import { LICENCES, PART_PHOTOS } from './index';

const croppedInManifest = new Set<PartId>(
  manifest.filter((entry) => 'crop' in entry).map((entry) => entry.part as PartId),
);

describe('PART_PHOTOS', () => {
  it('has one photo for every part', () => {
    expect(Object.keys(PART_PHOTOS).sort()).toEqual([...PART_IDS].sort());
  });

  describe.each(PART_IDS.map((id) => [id]))('%s', (id) => {
    const photo = PART_PHOTOS[id];

    it('describes the picture, separately from its caption', () => {
      expect(photo.alt.trim()).not.toBe('');
      expect(photo.caption.trim()).not.toBe('');
      expect(photo.alt).not.toBe(photo.caption);
    });

    it('presents itself as one example, not a recommendation', () => {
      expect(photo.caption.startsWith('One example: ')).toBe(true);
    });

    it('is credited under a free licence', () => {
      const { author, licence, licenceUrl, sourceUrl } = photo.credit;
      expect(author.trim()).not.toBe('');
      expect(LICENCES).toContain(licence);
      if (licence === 'Public domain') expect(licenceUrl).toBeUndefined();
      else expect(licenceUrl).toMatch(/^https:\/\//);
      expect(sourceUrl.startsWith('https://commons.wikimedia.org/wiki/File:')).toBe(true);
    });

    it('notes a crop exactly when the photo was cropped', () => {
      expect(photo.credit.cropped).toBe(croppedInManifest.has(id));
    });

    it('knows its size and both image files', () => {
      expect(Number.isInteger(photo.width) && photo.width > 0).toBe(true);
      expect(Number.isInteger(photo.height) && photo.height > 0).toBe(true);
      expect(photo.src).toMatch(/\.webp$/);
      expect(photo.srcLarge).toMatch(/\.webp$/);
      expect(photo.src).not.toBe(photo.srcLarge);
    });
  });

  it('says how the ESC example differs from the reference build', () => {
    expect(PART_PHOTOS.esc.caption).toBe(
      'One example: a single ESC, one per motor. On most 5″ builds the four sit together on one 4-in-1 board.',
    );
  });
});
