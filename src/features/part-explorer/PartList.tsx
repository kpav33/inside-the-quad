import { PART_LABELS, UI } from '@/content/ui';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { PART_IDS, type PartId } from '@/shared/domain/parts';
import { partQuantity } from '@/shared/domain/quantity';

import type { CSSProperties } from 'react';

import { LESSON_PANEL_ID, partButtonId } from './ids';

/** On wide layouts the list runs down the first column, then the second. */
const ROWS_PER_COLUMN = Math.ceil(PART_IDS.length / 2);

export interface PartListProps {
  selectedPart: PartId | null;
  /** Called with the pressed part; the parent decides whether that selects or deselects. */
  onToggle: (part: PartId) => void;
}

/**
 * The drawing's parts list, used as the part picker: item number, part, quantity. Wide layouts
 * split it into two columns (each with its own column headings) so the 3D view keeps its height.
 */
export function PartList({ selectedPart, onToggle }: PartListProps) {
  const { columns } = UI.parts;
  const columnHeadings = (
    <>
      <span>{columns.item}</span>
      <span>{columns.part}</span>
      <span>{columns.quantity}</span>
    </>
  );
  return (
    <nav className="part-list" aria-label={UI.parts.navLabel}>
      <h2 className="part-list-heading">{UI.parts.heading}</h2>
      <div
        className="part-list-table"
        style={{ '--part-list-rows': ROWS_PER_COLUMN } as CSSProperties}
      >
        <div className="part-list-columns" aria-hidden="true">
          {columnHeadings}
        </div>
        <div className="part-list-columns part-list-columns-second" aria-hidden="true">
          {columnHeadings}
        </div>
        <ul>
          {PART_IDS.map((part, index) => {
            const selected = selectedPart === part;
            return (
              <li key={part} data-column={index < ROWS_PER_COLUMN ? 1 : 2}>
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
      </div>
    </nav>
  );
}
