import type { ThreeEvent } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef } from 'react';

import { connectedParts, LESSONS } from '@/content/lessons';
import { overviewSpecs } from '@/content/overview';
import { PART_LABELS, UI } from '@/content/ui';
import { DroneViewer } from '@/features/drone-viewer';
import { useIntroRead, useReadParts } from '@/features/progress';
import type { PartId } from '@/shared/domain/parts';
import type { SheetId } from '@/shared/domain/sheets';
import { type Page, usePartRoute } from '@/shared/routing';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

import { isDeliberateClick } from './clicks';
import {
  INTRO_TITLE_ID,
  LESSON_PANEL_ID,
  lessonTitleId,
  OVERVIEW_FOCUS_ID,
  partButtonId,
} from './ids';
import { IntroPanel } from './IntroPanel';
import { LessonPanel } from './LessonPanel';
import { OverviewStart } from './OverviewStart';
import { PartList } from './PartList';
import { TitleBlock } from './TitleBlock';

/** Drawing-frame zone markers, as on a technical drawing's border. */
const ZONE_COLUMNS = ['1', '2', '3', '4'];
const ZONE_ROWS = ['A', 'B', 'C'];

/** No sheet open: nothing is connected, and the drawing is shown plainly. */
const NO_PARTS: ReadonlySet<PartId> = new Set();

const viewerFallback = <p role="alert">{UI.viewer.fallback}</p>;

/** Element id to focus after the next render, so keyboard focus never falls back to the page. */
type FocusTarget = string | null;

/** The heading of a sheet, which takes focus when the sheet opens. */
const sheetTitleId = (sheet: SheetId) =>
  sheet === 'intro' ? INTRO_TITLE_ID : lessonTitleId(sheet);

/**
 * Lets the user pick a drone part in the 3D view or the part list, and shows its lesson.
 * The list and lessons work on their own when the 3D view can't load.
 */
export function PartExplorer() {
  const { route, unknownSlug, cause, navigate } = usePartRoute();
  const selectedPart = route.kind === 'part' ? route.part : null;
  // The sheet in the sheet column: a part's lesson, the intro, or none (the overview).
  const openSheet: SheetId | null = route.kind === 'intro' ? 'intro' : selectedPart;
  const focusTarget = useRef<FocusTarget>(null);
  const { read, toggle: toggleRead, clear: clearRead } = useReadParts();
  const intro = useIntroRead();

  useEffect(() => {
    document.title =
      openSheet === 'intro'
        ? UI.app.introTitle
        : openSheet
          ? UI.app.pageTitle(PART_LABELS[openSheet])
          : UI.app.title;
  }, [openSheet]);

  // Back and Forward move focus to the sheet they open, so it never falls back to the page.
  useEffect(() => {
    if (cause !== 'pop') return;
    document.getElementById(openSheet ? sheetTitleId(openSheet) : OVERVIEW_FOCUS_ID)?.focus();
  }, [cause, openSheet]);

  // Any sheet the app opens takes focus at its heading, wherever it was opened from (the list, a
  // link, the masthead, the 3D model), so keyboard focus never stays behind. Closing sets its own
  // target. A page load moves no focus, and Back/Forward are handled above.
  useEffect(() => {
    const target =
      focusTarget.current ?? (cause === 'push' && openSheet ? sheetTitleId(openSheet) : null);
    focusTarget.current = null;
    if (target) document.getElementById(target)?.focus();
  }, [cause, openSheet]);

  // After choosing a part, bring the start of its lesson into view if it is off screen: below the
  // fold on phones, or scrolled away in the desktop sheet column. A lesson address opened directly
  // (a bookmark or shared link) is revealed too, at once and without moving focus.
  const revealLesson = useRef<'load' | 'choose' | null>(
    cause === 'load' && openSheet ? 'load' : null,
  );
  useEffect(() => {
    const reveal = revealLesson.current;
    if (!reveal || !openSheet) return;
    revealLesson.current = null;
    const panel = document.getElementById(LESSON_PANEL_ID);
    if (!panel) return;
    const { top } = panel.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight * 0.75) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const instant = reduceMotion || reveal === 'load';
      panel.scrollIntoView({ block: 'start', behavior: instant ? 'auto' : 'smooth' });
    }
  }, [openSheet]);

  // Closing a lesson returns focus to its row in the parts list; closing the intro, to the start.
  const closeLesson = useCallback(() => {
    if (!openSheet) return;
    focusTarget.current = openSheet === 'intro' ? OVERVIEW_FOCUS_ID : partButtonId(openSheet);
    navigate(null);
  }, [openSheet, navigate]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLesson();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [closeLesson]);

  const togglePart = (part: PartId) => {
    revealLesson.current = selectedPart !== part ? 'choose' : null;
    navigate(selectedPart === part ? null : part);
  };

  // A link in the sheet (a connection, previous or next) moves focus to what it opens.
  const followLink = (page: Page) => {
    focusTarget.current = page ? sheetTitleId(page) : OVERVIEW_FOCUS_ID;
    revealLesson.current = page !== null ? 'choose' : null;
  };

  const onPartClick = (part: PartId, event: ThreeEvent<MouseEvent>) => {
    if (!isDeliberateClick(event.delta)) return;
    // Clicking the part that is already open changes nothing, so there is nothing to reveal.
    revealLesson.current = part !== selectedPart ? 'choose' : null;
    navigate(part);
  };

  // A click on the empty 3D background clears a selected part; the intro stays open, so the
  // drone can be turned while reading it.
  const clearSelection = () => {
    if (selectedPart) navigate(null);
  };

  return (
    <div className="part-explorer">
      <p className="visually-hidden" aria-live="polite" data-testid="explorer-announcer">
        {openSheet === 'intro'
          ? UI.explorer.introOpened
          : openSheet
            ? UI.explorer.opened(PART_LABELS[openSheet])
            : ''}
      </p>
      <div className="part-explorer-field">
        <div className="drawing-frame">
          <div className="drawing-canvas">
            <div className="drawing-zones" aria-hidden="true">
              {ZONE_COLUMNS.map((zone) => (
                <span key={zone} className="drawing-zone drawing-zone-column">
                  {zone}
                </span>
              ))}
              {ZONE_ROWS.map((zone) => (
                <span key={zone} className="drawing-zone drawing-zone-row">
                  {zone}
                </span>
              ))}
            </div>
            <div className="part-explorer-viewer">
              <ErrorBoundary fallback={viewerFallback}>
                <Suspense fallback={<p role="status">{UI.viewer.loading}</p>}>
                  <DroneViewer
                    selectedPart={selectedPart}
                    connectedParts={selectedPart ? connectedParts(selectedPart) : NO_PARTS}
                    onPartClick={onPartClick}
                    onBackgroundClick={clearSelection}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
            <p className="drawing-hint" aria-hidden="true">
              <span className="drawing-hint-pointer">{UI.viewer.dragHint}</span>
              <span className="drawing-hint-touch">{UI.viewer.touchHint}</span>
            </p>
          </div>
          <PartList selectedPart={selectedPart} read={read} onToggle={togglePart} />
        </div>
      </div>
      <div className="part-explorer-sheet">
        {selectedPart ? (
          <LessonPanel
            lesson={LESSONS[selectedPart]}
            read={read.has(selectedPart)}
            onClose={closeLesson}
            onToggleRead={() => {
              toggleRead(selectedPart);
            }}
            onFollowLink={followLink}
          />
        ) : openSheet === 'intro' ? (
          <IntroPanel
            read={intro.read}
            onClose={closeLesson}
            onToggleRead={intro.toggle}
            onFollowLink={followLink}
          />
        ) : (
          <div className="part-explorer-overview">
            {unknownSlug !== null && (
              <p role="status" className="part-explorer-notice">
                {UI.explorer.unknownPart(unknownSlug)}
              </p>
            )}
            <TitleBlock
              part={UI.titleBlock.overviewPart}
              sheet={UI.titleBlock.overviewSheet}
              quantity={1}
              specs={overviewSpecs()}
            />
            <OverviewStart
              read={read}
              introRead={intro.read}
              onFollowLink={followLink}
              onClear={() => {
                clearRead();
                intro.clear();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
