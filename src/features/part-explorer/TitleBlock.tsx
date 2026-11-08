import type { Lesson } from '@/content/lessons';
import { UI } from '@/content/ui';

export interface TitleBlockProps {
  lesson: Lesson;
  sheet: number;
  sheets: number;
  quantity: number;
}

/** The drawing sheet's title block: which part, which sheet, how many, and its key numbers. */
export function TitleBlock({ lesson, sheet, sheets, quantity }: TitleBlockProps) {
  const t = UI.titleBlock;
  return (
    <div className="title-block" role="group" aria-label={t.label}>
      <div className="title-block-cell">
        <span className="title-block-label">{t.part}</span>
        <span className="title-block-value">{lesson.title}</span>
      </div>
      <div className="title-block-cell">
        <span className="title-block-label">{t.sheet}</span>
        <span className="title-block-value">{t.sheetOf(sheet, sheets)}</span>
      </div>
      <div className="title-block-cell">
        <span className="title-block-label">{t.quantity}</span>
        <span className="title-block-value">{quantity}</span>
      </div>
      <div className="title-block-cell title-block-spec">
        <span className="title-block-label">{t.spec}</span>
        <span className="title-block-value">
          {lesson.specs.map((row) => row.value).join(' · ')}
        </span>
      </div>
    </div>
  );
}
