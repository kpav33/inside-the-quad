import { UI } from '@/content/ui';

export interface TitleBlockProps {
  part: string;
  sheet: string;
  quantity: number;
  spec: string;
}

/** The drawing sheet's title block: which part, which sheet, how many, and its key numbers. */
export function TitleBlock({ part, sheet, quantity, spec }: TitleBlockProps) {
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
        <span className="title-block-value">{spec}</span>
      </div>
    </div>
  );
}
