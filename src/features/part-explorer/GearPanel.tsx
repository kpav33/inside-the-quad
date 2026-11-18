import { chargerSays, GEAR, gogglesSays, RADIO_MODES, radioSays } from '@/content/gear';
import { UI } from '@/content/ui';
import type { GearState } from '@/features/gear';
import type { GearId } from '@/shared/domain/gear';
import { chapterCount, sheetNumber } from '@/shared/domain/sheets';
import { type Page, PartLink } from '@/shared/routing';
import { ArrowIcon } from '@/shared/ui/icons';

import { ChapterSwitcher } from './ChapterSwitcher';
import { gearTitleId, LESSON_PANEL_ID } from './ids';
import { Question } from './Question';
import { SheetFooter, SheetRef } from './SheetFooter';
import { TitleBlock } from './TitleBlock';

export interface GearPanelProps {
  gear: GearId;
  state: GearState;
  onChange: (state: GearState) => void;
  /** The part drawn in redline, or null. */
  highlight: string | null;
  onHighlight: (part: string | null) => void;
  read: boolean;
  onClose: () => void;
  onToggleRead: () => void;
  /** Called before a link in the sheet opens another sheet (null: the overview). */
  onFollowLink?: (page: Page) => void;
}

const t = UI.gear;

/** A row of two or more pressed-or-not buttons, one per position of a switch. */
function Switch<Value extends string | boolean>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: readonly { value: Value; label: string }[];
  value: Value;
  onPick: (value: Value) => void;
}) {
  return (
    <div className="battery-switch" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          className="battery-switch-option"
          aria-pressed={option.value === value}
          onClick={() => {
            onPick(option.value);
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** The sheet's one thing to try: its switches, and a line saying what they do. */
function TryIt({ state, onChange }: { state: GearState; onChange: (state: GearState) => void }) {
  let switches;
  let says;
  switch (state.gear) {
    case 'radio':
      switches = (
        <>
          <Switch
            label={t.arm.label}
            options={[
              { value: false, label: t.arm.off },
              { value: true, label: t.arm.on },
            ]}
            value={state.armed}
            onPick={(armed) => {
              onChange({ ...state, armed });
            }}
          />
          <Switch
            label={t.modeLabel}
            options={RADIO_MODES.map(({ id, label }) => ({ value: id, label }))}
            value={state.mode}
            onPick={(mode) => {
              onChange({ ...state, mode });
            }}
          />
        </>
      );
      says = radioSays(state.armed, state.mode);
      break;
    case 'goggles':
      switches = (
        <Switch
          label={t.videoLabel}
          options={[
            { value: 'analog' as const, label: t.video.analog },
            { value: 'digital' as const, label: t.video.digital },
          ]}
          value={state.system}
          onPick={(system) => {
            onChange({ ...state, system });
          }}
        />
      );
      says = gogglesSays(state.system);
      break;
    case 'charger':
      switches = (
        <Switch
          label={t.chargerLabel}
          options={[
            { value: 'charge' as const, label: t.chargerMode.charge },
            { value: 'storage' as const, label: t.chargerMode.storage },
          ]}
          value={state.mode}
          onPick={(mode) => {
            onChange({ ...state, mode });
          }}
        />
      );
      says = chargerSays(state.mode);
      break;
  }
  return (
    <div className="gear-try" role="group" aria-label={t.tryLabel}>
      <p className="gear-try-label" aria-hidden="true">
        {t.tryLabel}
      </p>
      <div className="gear-try-switches">{switches}</div>
      <p className="gear-says" aria-live="polite" data-testid="gear-says">
        {says}
      </p>
    </div>
  );
}

/**
 * A gear sheet: title block, the chapter switcher, the four questions with the sheet's one thing
 * to try and the drawing's parts, then the way on. The drawing beside it shows what the switches
 * set, and lights the part whose name is pointed at.
 */
export function GearPanel({
  gear,
  state,
  onChange,
  highlight,
  onHighlight,
  read,
  onClose,
  onToggleRead,
  onFollowLink,
}: GearPanelProps) {
  const lesson = GEAR[gear];
  const titleId = gearTitleId(gear);
  const columns = UI.lesson.specColumns;

  return (
    <section id={LESSON_PANEL_ID} className="lesson-panel" aria-labelledby={titleId}>
      <header className="lesson-panel-header">
        <h2 id={titleId} tabIndex={-1}>
          {lesson.title}
        </h2>
        <button type="button" className="button-outline" onClick={onClose}>
          {t.close}
        </button>
      </header>

      <TitleBlock
        chapter={UI.chapters.gear}
        sheet={UI.titleBlock.sheetOf(sheetNumber(gear), chapterCount(gear))}
        specs={lesson.specs}
      />

      <ChapterSwitcher open={gear} onFollowLink={onFollowLink} />

      <Question number={1} heading={UI.lesson.questions[0]}>
        <p className="lesson-lead">{lesson.whatItDoes}</p>
        <TryIt state={state} onChange={onChange} />
      </Question>

      <Question number={2} heading={UI.lesson.questions[1]}>
        {lesson.howItWorks.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        <h4 className="gear-parts-heading">{t.partsHeading}</h4>
        <p className="gear-parts-hint">{t.partsHint}</p>
        <ul className="gear-parts">
          {lesson.parts.map((part) => {
            const on = () => {
              onHighlight(part.id);
            };
            const off = () => {
              onHighlight(null);
            };
            return (
              <li key={part.id} data-highlight={String(highlight === part.id)}>
                <button
                  type="button"
                  className="gear-part-name"
                  aria-pressed={highlight === part.id}
                  onFocus={on}
                  onBlur={off}
                  onMouseEnter={on}
                  onMouseLeave={off}
                  onClick={on}
                >
                  {part.label}
                </button>{' '}
                <span className="gear-part-note">{part.note}</span>
              </li>
            );
          })}
        </ul>
      </Question>

      <Question number={3} heading={UI.lesson.questions[2]}>
        <table className="spec-grid">
          <thead>
            <tr>
              <th scope="col">{columns.label}</th>
              <th scope="col">{columns.value}</th>
              <th scope="col">{columns.meaning}</th>
            </tr>
          </thead>
          <tbody>
            {lesson.specs.map((row, index) => (
              <tr key={index}>
                <th scope="row">{row.label}</th>
                <td className="spec-grid-value">{row.value}</td>
                <td>{row.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Question>

      <Question number={4} heading={UI.lesson.questions[3]}>
        <ul className="lesson-connections">
          {lesson.connections.map(({ text, partId }, index) => (
            <li key={index}>
              <span>{text}</span>
              {partId && (
                <PartLink
                  to={partId}
                  className="lesson-link lesson-connection-link"
                  onFollow={onFollowLink}
                >
                  <ArrowIcon />
                  <span>
                    <SheetRef sheet={partId} />
                  </span>
                </PartLink>
              )}
            </li>
          ))}
        </ul>
      </Question>

      <SheetFooter
        sheet={gear}
        read={read}
        onToggleRead={onToggleRead}
        onFollowLink={onFollowLink}
      />
    </section>
  );
}
