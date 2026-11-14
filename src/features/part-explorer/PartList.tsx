import { PART_LABELS, UI } from '@/content/ui';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { PART_IDS, type PartId } from '@/shared/domain/parts';
import { partQuantity } from '@/shared/domain/quantity';
import { CheckIcon } from '@/shared/ui/icons';

import type { CSSProperties } from 'react';

import { LESSON_PANEL_ID, partButtonId } from './ids';

/** Wider drawing fields split the list into two or three columns, each filled top to bottom. */
const ROWS_IN_TWO = Math.ceil(PART_IDS.length / 2);
const ROWS_IN_THREE = Math.ceil(PART_IDS.length / 3);

export interface PartListProps {
  selectedPart: PartId | null;
  /** The part under the mouse in the 3D view: its row gets the hover look. */
  hoveredPart: PartId | null;
  /** Parts whose lessons are marked as read: ticked after the name. */
  read: ReadonlySet<PartId>;
  /** Called with the pressed part; the parent decides whether that selects or deselects. */
  onToggle: (part: PartId) => void;
}

/**
 * The drawing's parts list, used as the part picker: item number, part, quantity. Wider drawing
 * fields split it into two or three columns (each with its own column headings) so the 3D view
 * keeps its height.
 */
export function PartList({ selectedPart, hoveredPart, read, onToggle }: PartListProps) {
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
        style={
          {
            '--part-list-rows-2': ROWS_IN_TWO,
            '--part-list-rows-3': ROWS_IN_THREE,
          } as CSSProperties
        }
      >
        <div className="part-list-columns" aria-hidden="true">
          {columnHeadings}
        </div>
        <div className="part-list-columns part-list-columns-second" aria-hidden="true">
          {columnHeadings}
        </div>
        <div className="part-list-columns part-list-columns-third" aria-hidden="true">
          {columnHeadings}
        </div>
        <ul>
          {PART_IDS.map((part, index) => {
            const selected = selectedPart === part;
            return (
              <li
                key={part}
                data-column-2={Math.floor(index / ROWS_IN_TWO) + 1}
                data-column-3={Math.floor(index / ROWS_IN_THREE) + 1}
              >
                <button
                  type="button"
                  id={partButtonId(part)}
                  className="part-list-row"
                  aria-pressed={selected}
                  aria-controls={selectedPart ? LESSON_PANEL_ID : undefined}
                  data-selected={selected}
                  data-hovered={hoveredPart === part ? 'true' : undefined}
                  onClick={() => {
                    onToggle(part);
                  }}
                >
                  <span className="part-list-item" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="part-list-name">
                    {read.has(part) ? (
                      <>
                        <span className="visually-hidden">
                          {UI.parts.readName(PART_LABELS[part])}
                        </span>
                        <span aria-hidden="true">{PART_LABELS[part]}</span>
                        <CheckIcon className="part-list-read" />
                      </>
                    ) : (
                      PART_LABELS[part]
                    )}
                  </span>
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
