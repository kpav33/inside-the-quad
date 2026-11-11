import type { ThreeEvent } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef } from 'react';

import { LESSONS } from '@/content/lessons';
import { overviewSpecs } from '@/content/overview';
import { PART_LABELS, UI } from '@/content/ui';
import { DroneViewer } from '@/features/drone-viewer';
import type { PartId } from '@/shared/domain/parts';
import { usePartRoute } from '@/shared/routing';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

import { isDeliberateClick } from './clicks';
import { LESSON_PANEL_ID, lessonTitleId, OVERVIEW_FOCUS_ID, partButtonId } from './ids';
import { LessonPanel } from './LessonPanel';
import { PartList } from './PartList';
import { TitleBlock } from './TitleBlock';

/** Drawing-frame zone markers, as on a technical drawing's border. */
const ZONE_COLUMNS = ['1', '2', '3', '4'];
const ZONE_ROWS = ['A', 'B', 'C'];

const viewerFallback = <p role="alert">{UI.viewer.fallback}</p>;

/** Element id to focus after the next render, so keyboard focus never falls back to the page. */
type FocusTarget = string | null;

/**
 * Lets the user pick a drone part in the 3D view or the part list, and shows its lesson.
 * The list and lessons work on their own when the 3D view can't load.
 */
export function PartExplorer() {
  const { route, unknownSlug, cause, navigate } = usePartRoute();
  const selectedPart = route.kind === 'part' ? route.part : null;
  const focusTarget = useRef<FocusTarget>(null);

  useEffect(() => {
    document.title = selectedPart ? UI.app.pageTitle(PART_LABELS[selectedPart]) : UI.app.title;
  }, [selectedPart]);

  // Back and Forward move focus to the sheet they open, so it never falls back to the page.
  useEffect(() => {
    if (cause !== 'pop') return;
    document
      .getElementById(selectedPart ? lessonTitleId(selectedPart) : OVERVIEW_FOCUS_ID)
      ?.focus();
  }, [cause, selectedPart]);

  useEffect(() => {
    if (focusTarget.current) {
      document.getElementById(focusTarget.current)?.focus();
      focusTarget.current = null;
    }
  }, [selectedPart]);

  // After choosing a part, bring the start of its lesson into view if it is off screen: below the
  // fold on phones, or scrolled away in the desktop sheet column.
  const revealLesson = useRef(false);
  useEffect(() => {
    if (!revealLesson.current || !selectedPart) return;
    revealLesson.current = false;
    const panel = document.getElementById(LESSON_PANEL_ID);
    if (!panel) return;
    const { top } = panel.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight * 0.75) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      panel.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }, [selectedPart]);

  const closeLesson = useCallback(() => {
    if (!selectedPart) return;
    focusTarget.current = partButtonId(selectedPart);
    navigate(null);
  }, [selectedPart, navigate]);

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
    revealLesson.current = selectedPart !== part;
    navigate(selectedPart === part ? null : part);
  };

  const followConnection = (part: PartId) => {
    focusTarget.current = lessonTitleId(part);
    navigate(part);
  };

  const onPartClick = (part: PartId, event: ThreeEvent<MouseEvent>) => {
    if (!isDeliberateClick(event.delta)) return;
    // Clicking the part that is already open changes nothing, so there is nothing to reveal.
    revealLesson.current = part !== selectedPart;
    navigate(part);
  };

  const clearSelection = () => {
    navigate(null);
  };

  return (
    <div className="part-explorer">
      <p className="visually-hidden" aria-live="polite" data-testid="explorer-announcer">
        {selectedPart ? UI.explorer.opened(PART_LABELS[selectedPart]) : ''}
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
          <PartList selectedPart={selectedPart} onToggle={togglePart} />
        </div>
      </div>
      <div className="part-explorer-sheet">
        {selectedPart ? (
          <LessonPanel
            lesson={LESSONS[selectedPart]}
            onClose={closeLesson}
            onSelectPart={followConnection}
          />
        ) : (
          <div id={OVERVIEW_FOCUS_ID} className="part-explorer-overview" tabIndex={-1}>
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
            <p className="part-explorer-hint">{UI.explorer.hint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
