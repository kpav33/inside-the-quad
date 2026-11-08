import type { ThreeEvent } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { LESSONS } from '@/content/lessons';
import { overviewSpec } from '@/content/overview';
import { UI } from '@/content/ui';
import { DroneViewer } from '@/features/drone-viewer';
import type { PartId } from '@/shared/domain/parts';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

import { isDeliberateClick } from './clicks';
import { lessonTitleId, partButtonId } from './ids';
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
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const focusTarget = useRef<FocusTarget>(null);

  useEffect(() => {
    if (focusTarget.current) {
      document.getElementById(focusTarget.current)?.focus();
      focusTarget.current = null;
    }
  }, [selectedPart]);

  const closeLesson = useCallback(() => {
    if (!selectedPart) return;
    focusTarget.current = partButtonId(selectedPart);
    setSelectedPart(null);
  }, [selectedPart]);

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
    setSelectedPart((current) => (current === part ? null : part));
  };

  const followConnection = (part: PartId) => {
    focusTarget.current = lessonTitleId(part);
    setSelectedPart(part);
  };

  const onPartClick = (part: PartId, event: ThreeEvent<MouseEvent>) => {
    if (isDeliberateClick(event.delta)) setSelectedPart(part);
  };

  const clearSelection = () => {
    setSelectedPart(null);
  };

  return (
    <div className="part-explorer">
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
          <div className="part-explorer-overview">
            <TitleBlock
              part={UI.titleBlock.overviewPart}
              sheet={UI.titleBlock.overviewSheet}
              quantity={1}
              specs={overviewSpec()}
            />
            <p className="part-explorer-hint">{UI.explorer.hint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
