import { UI } from '@/content/ui';

export interface TitleBlockProps {
  /** Left out on a lesson, whose heading already names the part. */
  part?: string;
  sheet: string;
  /** Left out on the intro, which is not a part. */
  quantity?: number;
  /** Labelled key numbers; each value stays on one line, so it is never split from its unit. */
  specs?: readonly { label: string; value: string }[];
}

/** The drawing sheet's title block: which part, which sheet, how many, and its key numbers. */
export function TitleBlock({ part, sheet, quantity, specs }: TitleBlockProps) {
  const t = UI.titleBlock;
  const className = [
    'title-block',
    part === undefined && 'title-block-without-part',
    quantity === undefined && 'title-block-sheet-only',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={className} role="group" aria-label={t.label}>
      {part !== undefined && (
        <div className="title-block-cell title-block-part">
          <span className="title-block-label">{t.part}</span>
          <span className="title-block-value">{part}</span>
        </div>
      )}
      <div className="title-block-cell">
        <span className="title-block-label">{t.sheet}</span>
        <span className="title-block-value">{sheet}</span>
      </div>
      {quantity !== undefined && (
        <div className="title-block-cell title-block-qty">
          <span className="title-block-label">{t.quantity}</span>
          <span className="title-block-value">{quantity}</span>
        </div>
      )}
      {specs && (
        <div className="title-block-cell title-block-spec">
          <span className="title-block-label">{t.spec}</span>
          <dl className="title-block-specs">
            {specs.map(({ label, value }, index) => (
              <div key={index} className="title-block-spec-item">
                <dt className="title-block-label">{label}</dt>
                <dd className="title-block-value title-block-nowrap">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
