import { PART_LABELS, UI } from '@/content/ui';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { PART_IDS, type PartId } from '@/shared/domain/parts';
import { partQuantity } from '@/shared/domain/quantity';

import { LESSON_PANEL_ID, partButtonId } from './ids';

export interface PartListProps {
  selectedPart: PartId | null;
  /** Called with the pressed part; the parent decides whether that selects or deselects. */
  onToggle: (part: PartId) => void;
}

/** The drawing's parts list, used as the part picker: item number, part, quantity. */
export function PartList({ selectedPart, onToggle }: PartListProps) {
  const { columns } = UI.parts;
  return (
    <nav className="part-list" aria-label={UI.parts.navLabel}>
      <h2 className="part-list-heading">{UI.parts.heading}</h2>
      <div className="part-list-columns" aria-hidden="true">
        <span>{columns.item}</span>
        <span>{columns.part}</span>
        <span>{columns.quantity}</span>
      </div>
      <ul>
        {PART_IDS.map((part, index) => {
          const selected = selectedPart === part;
          return (
            <li key={part}>
              <button
                type="button"
                id={partButtonId(part)}
                className="part-list-row"
                aria-pressed={selected}
                aria-controls={selectedPart ? LESSON_PANEL_ID : undefined}
                data-selected={selected}
                onClick={() => {
                  onToggle(part);
                }}
              >
                <span className="part-list-item" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="part-list-name">{PART_LABELS[part]}</span>
                <span className="part-list-qty" aria-hidden="true">
                  {partQuantity(part, REFERENCE_5_INCH)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
