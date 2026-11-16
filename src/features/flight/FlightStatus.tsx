import { useState, useSyncExternalStore } from 'react';

import { UI } from '@/content/ui';

import type { Flight } from './store';

const t = UI.whatIf;

const HEALTHY = ['false', '6', '0', 'false', 'true', 'false'].join('|');

/** The words for what changed between two status keys (see the key in FlightStatus). */
function describe(before: string, after: string): string {
  const [lost0, cells0, level0, prop0, armed0, ground0] = before.split('|');
  const [lost1, cells1, level1, prop1, armed1, ground1] = after.split('|');
  if (after === HEALTHY && before !== HEALTHY) return t.said.reset;
  if (ground1 === 'true' && ground0 !== 'true') return t.said.onGround;
  if (armed1 === 'false' && armed0 === 'true') return t.said.disarmed;
  if (lost1 === 'true' && lost0 !== 'true') return t.said.linkLost;
  if (prop1 === 'true' && prop0 !== 'true') return t.said.wrongProp;
  if (cells1 !== cells0) return t.said.battery(Number(cells1));
  const level = Number(level1);
  if (level !== Number(level0) && (level === 1 || level === 2 || level === 3)) {
    return `${t.status.vtx[level]}.`;
  }
  return '';
}

/**
 * The what-if sheet's status line over the drawing: the link, the battery, and the VTX's heat
 * once it is heating. A lost link and a damaged VTX are marked. It changes only with them.
 */
export function FlightStatus({ flight }: { flight: Flight }) {
  const key = useSyncExternalStore(
    (listener) => {
      const offWake = flight.onWake(listener);
      const offStep = flight.subscribe(listener);
      return () => {
        offWake();
        offStep();
      };
    },
    () =>
      [
        flight.faults.linkLost,
        flight.faults.cells,
        flight.state.vtxLevel,
        flight.faults.wrongProp,
        flight.state.armed,
        flight.state.onGround,
      ].join('|'),
  );
  // What changed since the last change, said once for assistive technology.
  const [said, setSaid] = useState({ key, message: '' });
  if (said.key !== key) setSaid({ key, message: describe(said.key, key) });
  const [lost, cells, level] = key.split('|');
  const vtxLevel = Number(level) as 0 | 1 | 2 | 3;
  return (
    <>
      <p className="visually-hidden" aria-live="polite" data-testid="flight-announcer">
        {said.message}
      </p>
      <p
        className="flight-status"
        data-testid="flight-status"
        data-avoid-pins=""
        aria-label={t.status.label}
      >
        <span data-alert={lost === 'true' ? 'true' : undefined}>
          {lost === 'true' ? t.status.linkLost : t.status.linkOk}
        </span>
        {' · '}
        <span>{t.cells(Number(cells))}</span>
        {vtxLevel !== 0 && (
          <>
            {' · '}
            <span data-alert={vtxLevel === 3 ? 'true' : undefined}>{t.status.vtx[vtxLevel]}</span>
          </>
        )}
      </p>
    </>
  );
}
