import { sheetName, UI } from '@/content/ui';
import { isPathId } from '@/shared/domain/paths';
import { CHAPTER_SHEETS, chapterOf, type NumberedSheet } from '@/shared/domain/sheets';
import { type Page, PartLink } from '@/shared/routing';

/** A sheet's name in the switcher: a path's short name, else its full name. */
function shortName(sheet: NumberedSheet): string {
  return isPathId(sheet) ? UI.paths.short[sheet] : sheetName(sheet);
}

/**
 * Every sheet of the open sheet's chapter, the open one marked (How it works together, or the
 * gear), so each is one step away from any of the others.
 */
export function ChapterSwitcher({
  open,
  onFollowLink,
}: {
  open: NumberedSheet;
  onFollowLink?: ((page: Page) => void) | undefined;
}) {
  const chapter = chapterOf(open);
  // A chapter of one sheet (Plan a build) has nothing to switch to.
  if (CHAPTER_SHEETS[chapter].length < 2) return null;
  return (
    <nav className="path-switcher" aria-label={UI.chapters[chapter]}>
      {CHAPTER_SHEETS[chapter].map((sheet) => (
        <PartLink
          key={sheet}
          to={sheet}
          className="path-switcher-link"
          current={sheet === open}
          onFollow={onFollowLink}
        >
          {shortName(sheet)}
        </PartLink>
      ))}
    </nav>
  );
}
