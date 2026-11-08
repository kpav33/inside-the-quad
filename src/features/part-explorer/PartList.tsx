import { PART_LABELS, UI } from '@/content/ui';
import { PART_IDS, type PartId } from '@/shared/domain/parts';

import { LESSON_PANEL_ID, partButtonId } from './ids';

export interface PartListProps {
  selectedPart: PartId | null;
  /** Called with the pressed part; the parent decides whether that selects or deselects. */
  onToggle: (part: PartId) => void;
}

export function PartList({ selectedPart, onToggle }: PartListProps) {
  return (
    <nav className="part-list" aria-label={UI.parts.navLabel}>
      <ul>
        {PART_IDS.map((part) => (
          <li key={part}>
            <button
              type="button"
              id={partButtonId(part)}
              aria-pressed={selectedPart === part}
              aria-controls={selectedPart ? LESSON_PANEL_ID : undefined}
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
