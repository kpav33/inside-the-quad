import { useEffect, useState } from 'react';

import type { Axes } from './model';
import type { Flight } from './store';

/** What the flight controller compares: the rotation the sticks ask for, and what the gyro measures. */
export interface FlightReadout {
  wanted: Axes;
  measured: Axes;
}

const toDps = (axes: Axes): Axes => ({
  roll: Math.round((axes.roll * 180) / Math.PI),
  pitch: Math.round((axes.pitch * 180) / Math.PI),
  yaw: Math.round((axes.yaw * 180) / Math.PI),
});

function read(flight: Flight): FlightReadout {
  return { wanted: toDps(flight.state.wanted), measured: toDps(flight.state.rate) };
}

/** The flight's wanted and measured rotation in whole °/s, updated at most every `everyMs`. */
export function useFlightReadout(flight: Flight | null, everyMs = 100): FlightReadout | null {
  const [readout, setReadout] = useState<{ flight: Flight; value: FlightReadout } | null>(null);
  useEffect(() => {
    if (!flight) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    setReadout({ flight, value: read(flight) });
    const off = flight.subscribe(() => {
      timer ??= setTimeout(() => {
        timer = null;
        setReadout({ flight, value: read(flight) });
      }, everyMs);
    });
    return () => {
      off();
      if (timer) clearTimeout(timer);
    };
  }, [flight, everyMs]);
  if (!flight) return null;
  return readout?.flight === flight ? readout.value : read(flight);
}
