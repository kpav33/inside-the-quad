import { PART_LABELS, UI } from '@/content/ui';
import { PART_IDS } from '@/shared/domain/parts';
import { type SheetId, sheetNeighbours } from '@/shared/domain/sheets';
import { type Page, PartLink } from '@/shared/routing';
import { ArrowIcon, CheckIcon } from '@/shared/ui/icons';

/**
 * "Battery · sheet 6": a reference to another sheet; the sheet number never wraps apart. The intro
 * has no number and is named by its title.
 */
export function SheetRef({ sheet }: { sheet: SheetId }) {
  if (sheet === 'intro') return <>{UI.intro.link}</>;
  return (
    <>
      {PART_LABELS[sheet]}{' '}
      <span className="nowrap">{UI.lesson.sheetNumber(PART_IDS.indexOf(sheet) + 1)}</span>
    </>
  );
}

export interface SheetFooterProps {
  sheet: SheetId;
  /** Whether the learner has marked this sheet as read. */
  read: boolean;
  onToggleRead: () => void;
  /** Called before a link in the footer opens another sheet (null: the overview). */
  onFollowLink?: ((page: Page) => void) | undefined;
}

/** The end of every sheet: mark it as read, then the previous and next sheets. */
export function SheetFooter({ sheet, read, onToggleRead, onFollowLink }: SheetFooterProps) {
  const { previous, next } = sheetNeighbours(sheet);
  return (
    <nav className="lesson-footer" aria-label={UI.lesson.footerLabel}>
      <button
        type="button"
        className="button-outline lesson-read"
        aria-pressed={read}
        aria-label={UI.lesson.markRead}
        onClick={onToggleRead}
      >
        {read ? (
          <>
            <CheckIcon />
            {UI.lesson.isRead}
          </>
        ) : (
          UI.lesson.markRead
        )}
      </button>
      <div className="lesson-sheets">
        {previous ? (
          <PartLink to={previous} className="lesson-sheet-link" onFollow={onFollowLink}>
            <span className="lesson-sheet-label">
              <ArrowIcon back />
              {UI.lesson.previous}
              <span className="visually-hidden">:</span>
            </span>{' '}
            <span className="lesson-sheet-target">
              <SheetRef sheet={previous} />
            </span>
          </PartLink>
        ) : (
          <span className="lesson-sheet-link lesson-sheet-empty" aria-hidden="true" />
        )}
        <PartLink to={next} className="lesson-sheet-link lesson-sheet-next" onFollow={onFollowLink}>
          <span className="lesson-sheet-label">
            {UI.lesson.next}
            <span className="visually-hidden">:</span>
            <ArrowIcon />
          </span>{' '}
          <span className="lesson-sheet-target">
            {next ? <SheetRef sheet={next} /> : UI.lesson.backToOverview}
          </span>
        </PartLink>
      </div>
    </nav>
  );
}
