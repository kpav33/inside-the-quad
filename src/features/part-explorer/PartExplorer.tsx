import type { ThreeEvent } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { LESSONS } from '@/content/lessons';
import { DroneViewer } from '@/features/drone-viewer';
import type { PartId } from '@/shared/domain/parts';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

import { isDeliberateClick } from './clicks';
import { lessonTitleId, partButtonId } from './ids';
import { LessonPanel } from './LessonPanel';
import { PartList } from './PartList';

const viewerFallback = (
  <p role="alert">
    The 3D model couldn’t be loaded. Your browser may not support WebGL, or the page needs a reload.
    You can still explore every part with the list.
  </p>
);

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
      <div className="part-explorer-viewer">
        <ErrorBoundary fallback={viewerFallback}>
          <Suspense fallback={<p role="status">Loading 3D model…</p>}>
            <DroneViewer
              selectedPart={selectedPart}
              onPartClick={onPartClick}
              onBackgroundClick={clearSelection}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
      <div className="part-explorer-sidebar">
        <PartList selectedPart={selectedPart} onToggle={togglePart} />
        {selectedPart ? (
          <LessonPanel
            lesson={LESSONS[selectedPart]}
            onClose={closeLesson}
            onSelectPart={followConnection}
          />
        ) : (
          <p className="part-explorer-hint">
            Select a part on the drone or in the list to see what it does and how it works.
          </p>
        )}
      </div>
    </div>
  );
}
