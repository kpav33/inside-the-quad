import { Fragment } from 'react';

import { UI } from '@/content/ui';

export interface TitleBlockProps {
  part: string;
  sheet: string;
  quantity: number;
  /** Spec values; each stays on one line, so a number is never split from its unit. */
  specs: readonly string[];
}

/** The drawing sheet's title block: which part, which sheet, how many, and its key numbers. */
export function TitleBlock({ part, sheet, quantity, specs }: TitleBlockProps) {
  const t = UI.titleBlock;
  return (
    <div className="title-block" role="group" aria-label={t.label}>
      <div className="title-block-cell">
        <span className="title-block-label">{t.part}</span>
        <span className="title-block-value">{part}</span>
      </div>
      <div className="title-block-cell">
        <span className="title-block-label">{t.sheet}</span>
        <span className="title-block-value">{sheet}</span>
      </div>
      <div className="title-block-cell">
        <span className="title-block-label">{t.quantity}</span>
        <span className="title-block-value">{quantity}</span>
      </div>
      <div className="title-block-cell title-block-spec">
        <span className="title-block-label">{t.spec}</span>
        <span className="title-block-value">
          {specs.map((value, index) => (
            <Fragment key={index}>
              {index > 0 && ' · '}
              <span className="title-block-nowrap">{value}</span>
            </Fragment>
          ))}
        </span>
      </div>
    </div>
  );
}
