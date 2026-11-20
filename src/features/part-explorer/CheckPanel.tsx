import { useId, useState } from 'react';

import { CHECKER, checkLesson, checkName, checkReason, optionLabel } from '@/content/checker';
import { UI } from '@/content/ui';
import {
  BUILD_OPTIONS,
  type Build,
  checkBuild,
  type CheckStatus,
  KV_RANGE,
} from '@/shared/domain/build-check';
import { CHECK_SHEET } from '@/shared/domain/check';
import type { PartId } from '@/shared/domain/parts';
import { chapterCount, sheetNumber } from '@/shared/domain/sheets';
import { type Page, PartLink } from '@/shared/routing';
import { ArrowIcon, CautionIcon, CheckIcon, CrossIcon } from '@/shared/ui/icons';

import { CHECK_TITLE_ID, LESSON_PANEL_ID } from './ids';
import { Question } from './Question';
import { SheetFooter, SheetRef } from './SheetFooter';
import { TitleBlock } from './TitleBlock';

export interface CheckPanelProps {
  build: Build;
  onChange: (change: Partial<Build>) => void;
  onReset: () => void;
  /** The parts of the check pointed at or focused, lit on the drawing; null for none. */
  onHighlight: (parts: readonly PartId[] | null) => void;
  read: boolean;
  onClose: () => void;
  onToggleRead: () => void;
  /** Called before a link in the sheet opens another sheet (null: the overview). */
  onFollowLink?: (page: Page) => void;
}

const t = UI.checker;

const STATUS_ICONS: Record<CheckStatus, typeof CheckIcon> = {
  fits: CheckIcon,
  check: CautionIcon,
  fails: CrossIcon,
};

/** A typed KV: a whole number in range, else null (not entered). */
function readKv(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const kv = Number(trimmed);
  return kv >= KV_RANGE[0] && kv <= KV_RANGE[1] ? kv : null;
}

/**
 * The motors' KV, typed. What is typed stays as typed; the build gets the number, or null while
 * it isn't a whole number in range. A KV changed from outside (Reset) replaces the text.
 */
function KvField({ kv, onChange }: { kv: number | null; onChange: (kv: number | null) => void }) {
  const id = useId();
  // `seen` is the KV this text last matched. When the build's KV changes, the text stays if it
  // reads as the new KV (the change came from typing), else it is replaced (Reset).
  const [text, setText] = useState({ seen: kv, value: kv === null ? '' : String(kv) });
  if (text.seen !== kv) {
    setText({
      seen: kv,
      value: readKv(text.value) === kv ? text.value : kv === null ? '' : String(kv),
    });
  }
  return (
    <div className="check-field">
      <label htmlFor={id}>{fieldLabel('kv')}</label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="check-input"
        aria-describedby={`${id}-hint`}
        value={text.value}
        onChange={(event) => {
          const value = event.target.value;
          setText((current) => ({ ...current, value }));
          onChange(readKv(value));
        }}
      />
      <span id={`${id}-hint`} className="check-hint">
        {CHECKER.kvHint}
      </span>
    </div>
  );
}

function fieldLabel(field: keyof Build): string {
  for (const group of CHECKER.groups) {
    const found = group.fields.find((f) => f.field === field);
    if (found) return found.label;
  }
  return field;
}

/** Fields whose options are words, shown as choices so a long one wraps instead of being cut. */
const CHOICE_FIELDS: readonly (keyof Build)[] = ['vtxVideo', 'goggles'];

/** One field's options as radio buttons, each name wrapping on its own line. */
function ChoiceField({
  field,
  label,
  build,
  onChange,
}: {
  field: keyof Build;
  label: string;
  build: Build;
  onChange: (change: Partial<Build>) => void;
}) {
  const id = useId();
  const options: readonly Build[keyof Build][] = BUILD_OPTIONS[field] ?? [];
  return (
    <div className="check-field" role="radiogroup" aria-labelledby={`${id}-label`}>
      <span id={`${id}-label`}>{label}</span>
      {options.map((option, index) => (
        <label key={index} className="check-choice">
          <input
            type="radio"
            name={id}
            checked={option === build[field]}
            onChange={() => {
              onChange({ [field]: option });
            }}
          />
          <span>{optionLabel(field, option)}</span>
        </label>
      ))}
    </div>
  );
}

/** A pick list for one field, its options labelled as on shop pages. */
function PickField({
  field,
  label,
  build,
  onChange,
}: {
  field: keyof Build;
  label: string;
  build: Build;
  onChange: (change: Partial<Build>) => void;
}) {
  const id = useId();
  const options: readonly Build[keyof Build][] = BUILD_OPTIONS[field] ?? [];
  const current = options.findIndex(
    (option) => JSON.stringify(option) === JSON.stringify(build[field]),
  );
  return (
    <div className="check-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className="check-select"
        value={String(current)}
        onChange={(event) => {
          const option = options[Number(event.target.value)];
          if (option !== undefined) onChange({ [field]: option });
        }}
      >
        {options.map((option, index) => (
          <option key={index} value={String(index)}>
            {optionLabel(field, option)}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Check a build: title block, a lead, the summary and the seven results (each with its status,
 * why and the lesson behind it), then the parts and their numbers, Reset and the footer. Pointing
 * at a result lights its parts on the drawing.
 */
export function CheckPanel({
  build,
  onChange,
  onReset,
  onHighlight,
  read,
  onClose,
  onToggleRead,
  onFollowLink,
}: CheckPanelProps) {
  const results = checkBuild(build);
  const counts = { fits: 0, check: 0, fails: 0 };
  for (const result of results) counts[result.status] += 1;
  const resultsHeadingId = useId();

  return (
    <section
      id={LESSON_PANEL_ID}
      className="lesson-panel check-panel"
      aria-labelledby={CHECK_TITLE_ID}
    >
      <header className="lesson-panel-header">
        <h2 id={CHECK_TITLE_ID} tabIndex={-1}>
          {t.title}
        </h2>
        <button type="button" className="button-outline" onClick={onClose}>
          {t.close}
        </button>
      </header>

      <TitleBlock
        chapter={UI.chapters.build}
        sheet={UI.titleBlock.sheetOf(sheetNumber(CHECK_SHEET), chapterCount(CHECK_SHEET))}
      />

      <p className="lesson-lead">{CHECKER.lead}</p>

      <Question number={1} heading={t.resultsHeading} headingId={resultsHeadingId}>
        <div className="check-results" aria-live="polite" data-testid="check-results">
          <p className="check-summary">{t.summary(counts)}</p>
          <ul className="check-result-list" aria-labelledby={resultsHeadingId}>
            {results.map((result) => {
              const Icon = STATUS_ICONS[result.status];
              const lesson = checkLesson(result.id);
              const on = () => {
                onHighlight(result.parts);
              };
              const off = () => {
                onHighlight(null);
              };
              return (
                <li
                  key={result.id}
                  className="check-result"
                  data-status={result.status}
                  onMouseEnter={on}
                  onMouseLeave={off}
                  onFocus={on}
                  onBlur={off}
                >
                  <span className="check-result-status">
                    <Icon className="check-result-icon" />
                    {t.status[result.status]}
                    <span className="visually-hidden">:</span>
                  </span>{' '}
                  <span className="check-result-body">
                    <span className="check-result-name">{checkName(result.id)}</span>{' '}
                    <span className="check-result-reason">{checkReason(result, build)}</span>
                    <PartLink
                      to={lesson}
                      className="lesson-link lesson-connection-link check-result-link"
                      onFollow={onFollowLink}
                    >
                      <ArrowIcon />
                      <span>
                        <SheetRef sheet={lesson} />
                      </span>
                    </PartLink>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </Question>

      <Question number={2} heading={t.partsHeading}>
        <div className="check-parts">
          {CHECKER.groups.map((group) => (
            <fieldset key={group.heading} className="check-group">
              <legend>{group.heading}</legend>
              {group.fields.map(({ field, label }) =>
                field === 'kv' ? (
                  <KvField
                    key={field}
                    kv={build.kv}
                    onChange={(kv) => {
                      onChange({ kv });
                    }}
                  />
                ) : CHOICE_FIELDS.includes(field) ? (
                  <ChoiceField
                    key={field}
                    field={field}
                    label={label}
                    build={build}
                    onChange={onChange}
                  />
                ) : (
                  <PickField
                    key={field}
                    field={field}
                    label={label}
                    build={build}
                    onChange={onChange}
                  />
                ),
              )}
            </fieldset>
          ))}
        </div>
        <button type="button" className="button-outline check-reset" onClick={onReset}>
          {t.reset}
        </button>
      </Question>

      <SheetFooter
        sheet={CHECK_SHEET}
        read={read}
        onToggleRead={onToggleRead}
        onFollowLink={onFollowLink}
      />
    </section>
  );
}
