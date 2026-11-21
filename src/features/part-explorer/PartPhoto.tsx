import type { PartPhoto as Photo } from '@/content/photos';
import { UI } from '@/content/ui';

/** Images fill the sheet column up to its widest (36rem) and the full width on narrow screens. */
/** The small file's width; the large one is the photo's own width, at most 1280. */
const SMALL_WIDTH = 640;

const SIZES = '(min-width: 56rem) 36rem, 100vw';

/**
 * A real photo of the part, under the title block: one example, captioned as such, with the credit
 * its licence asks for.
 */
export function PartPhoto({
  photo,
  label = UI.photo.label,
}: {
  photo: Photo;
  /** Over the photo: "Real part", or on a gear sheet "Real gear". */
  label?: string;
}) {
  const { title, author, licence, licenceUrl, sourceUrl, cropped } = photo.credit;
  const text = UI.photo;
  return (
    <figure className="part-photo">
      <p className="part-photo-label" aria-hidden="true">
        {label}
      </p>
      <img
        src={photo.src}
        srcSet={`${photo.src} ${Math.min(SMALL_WIDTH, photo.width)}w, ${photo.srcLarge} ${photo.width}w`}
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
          {text.by}{' '}
          {sourceUrl ? (
            <>
              <a href={sourceUrl} rel="noreferrer">
                {text.title(title)}
              </a>{' '}
              {text.byAuthor(author)}
            </>
          ) : (
            // The app's own photo: no page elsewhere to link, credited by name.
            author
          )}
          ,{' '}
          {licenceUrl ? (
            <a href={licenceUrl} rel="noreferrer">
              {licence}
            </a>
          ) : (
            licence
          )}
          .{cropped ? ` ${text.cropped(licence.includes('SA'))}` : ''}
          {sourceUrl ? ` ${text.via}` : ''}
        </span>
      </figcaption>
    </figure>
  );
}
