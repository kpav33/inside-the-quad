import { sheetName, UI } from '@/content/ui';
import { isPathId } from '@/shared/domain/paths';
import { CHAPTER_SHEETS, type NumberedSheet } from '@/shared/domain/sheets';
import { type Page, PartLink } from '@/shared/routing';

/** A sheet's name in the switcher: a path's short name, else its full name. */
function shortName(sheet: NumberedSheet): string {
  return isPathId(sheet) ? UI.paths.short[sheet] : sheetName(sheet);
}

/**
 * Every sheet of How it works together, the open one marked: the three paths and How a quad moves,
 * so each is one step away from any of the others.
 */
export function ChapterSwitcher({
  open,
  onFollowLink,
}: {
  open: NumberedSheet;
  onFollowLink?: ((page: Page) => void) | undefined;
}) {
  return (
    <nav className="path-switcher" aria-label={UI.paths.switcherLabel}>
      {CHAPTER_SHEETS.paths.map((sheet) => (
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
