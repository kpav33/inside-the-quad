import type { PartPhoto as Photo } from '@/content/photos';
import { UI } from '@/content/ui';

/** Images fill the sheet column up to its widest (36rem) and the full width on narrow screens. */
const SIZES = '(min-width: 56rem) 36rem, 100vw';

/**
 * A real photo of the part, under the title block: one example, captioned as such, with the credit
 * its licence asks for.
 */
export function PartPhoto({ photo }: { photo: Photo }) {
  const { author, licence, licenceUrl, sourceUrl, cropped } = photo.credit;
  const text = UI.photo;
  return (
    <figure className="part-photo">
      <p className="part-photo-label" aria-hidden="true">
        {text.label}
      </p>
      <img
        src={photo.src}
        srcSet={`${photo.src} 640w, ${photo.srcLarge} 1280w`}
        sizes={SIZES}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        <span className="part-photo-caption">{photo.caption}</span>
        <span className="part-photo-credit">
          {text.by} {author},{' '}
          {licenceUrl ? (
            <a href={licenceUrl} rel="noreferrer">
              {licence}
            </a>
          ) : (
            licence
          )}
          .{cropped ? ` ${text.cropped(licence.includes('SA'))}` : ''} {text.via}{' '}
          <a href={sourceUrl} rel="noreferrer">
            {text.source}
          </a>
          .
        </span>
      </figcaption>
    </figure>
  );
}
