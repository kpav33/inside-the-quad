import { sheetName, UI } from '@/content/ui';
import {
  type Chapter,
  chapterOf,
  type SheetId,
  sheetNeighbours,
  sheetNumber,
} from '@/shared/domain/sheets';
import { type Page, PartLink } from '@/shared/routing';
import { ArrowIcon, CheckIcon } from '@/shared/ui/icons';

const CHAPTER_ORDER: readonly Chapter[] = ['parts', 'paths', 'gear'];

/** True when moving from one sheet to the other crosses from one chapter into another. */
function crossesChapter(from: SheetId, to: SheetId | null): boolean {
  if (from === 'intro' || to === null || to === 'intro') return false;
  return chapterOf(from) !== chapterOf(to);
}

/**
 * "Battery · sheet 6": a reference to another sheet; the sheet number never wraps apart. A sheet
 * named from an earlier chapter carries its own chapter ("How it works together, sheet 1: Control
 * path"), since its number counts from 1 again; going back, the footer label names the chapter.
 * The intro has no number and is named by its title.
 */
export function SheetRef({ sheet, from }: { sheet: SheetId; from?: SheetId }) {
  if (sheet === 'intro') return <>{UI.intro.link}</>;
  if (from !== undefined && from !== 'intro' && crossesChapter(from, sheet)) {
    const into = chapterOf(sheet);
    if (CHAPTER_ORDER.indexOf(into) > CHAPTER_ORDER.indexOf(chapterOf(from))) {
      return (
        <>{UI.lesson.sheetInChapter(UI.chapters[into], sheetNumber(sheet), sheetName(sheet))}</>
      );
    }
  }
  return (
    <>
      {sheetName(sheet)} <span className="nowrap">{UI.lesson.sheetNumber(sheetNumber(sheet))}</span>
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
  // The footer marks the step from one chapter into the other.
  const backAcross = crossesChapter(sheet, previous);
  const onAcross = crossesChapter(sheet, next);
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
              {backAcross && previous !== 'intro'
                ? UI.lesson.backTo[chapterOf(previous)]
                : UI.lesson.previous}
              <span className="visually-hidden">:</span>
            </span>{' '}
            <span className="lesson-sheet-target">
              <SheetRef sheet={previous} from={sheet} />
            </span>
          </PartLink>
        ) : (
          <span className="lesson-sheet-link lesson-sheet-empty" aria-hidden="true" />
        )}
        <PartLink to={next} className="lesson-sheet-link lesson-sheet-next" onFollow={onFollowLink}>
          <span className="lesson-sheet-label">
            {onAcross && sheet !== 'intro' ? UI.lesson.endOf[chapterOf(sheet)] : UI.lesson.next}
            <span className="visually-hidden">:</span>
            <ArrowIcon />
          </span>{' '}
          <span className="lesson-sheet-target">
            {next ? <SheetRef sheet={next} from={sheet} /> : UI.lesson.backToOverview}
          </span>
        </PartLink>
      </div>
    </nav>
  );
}
