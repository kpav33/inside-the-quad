import { PART_IDS, PART_LABELS, type PartId } from '@/shared/domain/parts';

import { LESSON_PANEL_ID, partButtonId } from './ids';

export interface PartListProps {
  selectedPart: PartId | null;
  /** Called with the pressed part; the parent decides whether that selects or deselects. */
  onToggle: (part: PartId) => void;
}

export function PartList({ selectedPart, onToggle }: PartListProps) {
  return (
    <nav className="part-list" aria-label="Drone parts">
      <ul>
        {PART_IDS.map((part) => (
          <li key={part}>
            <button
              type="button"
              id={partButtonId(part)}
              aria-pressed={selectedPart === part}
              aria-controls={LESSON_PANEL_ID}
              onClick={() => {
                onToggle(part);
              }}
            >
              {PART_LABELS[part]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
