import { useSyncExternalStore } from 'react';

import { UI } from '@/content/ui';

import type { Flight } from './store';

const t = UI.whatIf;

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
      `${String(flight.faults.linkLost)}|${String(flight.faults.cells)}|${String(flight.state.vtxLevel)}`,
  );
  const [lost, cells, level] = key.split('|');
  const vtxLevel = Number(level) as 0 | 1 | 2 | 3;
  return (
    <p className="flight-status" data-testid="flight-status" aria-label={t.status.label}>
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
  );
}
