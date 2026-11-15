import { type PointerEvent, useEffect, useRef, useSyncExternalStore } from 'react';

import { UI } from '@/content/ui';

import type { StickInput } from './model';
import type { Flight } from './store';

type Axis = keyof StickInput;
type SpringAxis = Exclude<Axis, 'throttle'>;

const t = UI.moves.sticks;

/** What a slider says to assistive technology: "Roll 40 % right", "Throttle 50 %". */
function valueText(axis: Axis, value: number): string {
  if (axis === 'throttle') return t.throttleValue(Math.round(value * 100));
  const percent = Math.round(Math.abs(value) * 100);
  if (percent === 0) return t.centred(t[axis]);
  const [negative, positive] = t.ways[axis];
  return t.value(t[axis], percent, value > 0 ? positive : negative);
}

/** One axis as a native slider: hidden, but it carries the stick for the keyboard and screen readers. */
function AxisSlider({
  flight,
  axis,
  value,
  vertical,
}: {
  flight: Flight;
  axis: Axis;
  value: number;
  vertical: boolean;
}) {
  const springs = axis !== 'throttle';
  const centre = () => {
    if (springs) flight.setSticks({ [axis]: 0 }, 'user');
  };
  return (
    <input
      type="range"
      className="visually-hidden stick-axis"
      data-axis={axis}
      aria-label={t[axis]}
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      aria-valuetext={valueText(axis, value)}
      min={springs ? -100 : 0}
      max={100}
      step={springs ? 10 : 5}
      value={Math.round(value * 100)}
      onChange={(event) => {
        flight.setSticks({ [axis]: Number(event.target.value) / 100 }, 'user');
      }}
      // A stick on a real radio springs back to centre when let go; here, when the key is.
      onKeyUp={centre}
      onBlur={centre}
    />
  );
}

/**
 * One gimbal: a square pad with a crosshair and a thumb. Dragging sets both axes from the pointer's
 * place on the pad; letting go (or losing the pointer) springs the spring axes back to centre.
 */
function Stick({
  flight,
  sticks,
  side,
  across,
  upDown,
}: {
  flight: Flight;
  sticks: StickInput;
  side: 'left' | 'right';
  across: SpringAxis;
  upDown: 'throttle' | 'pitch';
}) {
  const dragging = useRef<number | null>(null);
  const x = sticks[across];
  const y = upDown === 'throttle' ? sticks.throttle * 2 - 1 : sticks[upDown];

  const follow = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const across01 = (event.clientX - rect.left) / rect.width;
    const up01 = 1 - (event.clientY - rect.top) / rect.height;
    flight.setSticks(
      {
        [across]: across01 * 2 - 1,
        [upDown]: upDown === 'throttle' ? up01 : up01 * 2 - 1,
      },
      'user',
    );
  };
  const release = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current !== event.pointerId) return;
    dragging.current = null;
    flight.setSticks(upDown === 'throttle' ? { [across]: 0 } : { [across]: 0, pitch: 0 }, 'user');
  };

  return (
    <div className="stick" data-side={side} data-avoid-pins="">
      <div
        className="stick-pad"
        data-side={side}
        role="group"
        aria-label={side === 'left' ? t.left : t.right}
        onPointerDown={(event) => {
          dragging.current = event.pointerId;
          // jsdom has no pointer capture.
          if ('setPointerCapture' in event.currentTarget) {
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          follow(event);
        }}
        onPointerMove={(event) => {
          if (dragging.current === event.pointerId) follow(event);
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <span className="stick-cross" aria-hidden="true" />
        <span
          className="stick-thumb"
          aria-hidden="true"
          style={{ left: `${String((x + 1) * 50)}%`, top: `${String((1 - y) * 50)}%` }}
        />
        <AxisSlider flight={flight} axis={upDown} value={sticks[upDown]} vertical />
        <AxisSlider flight={flight} axis={across} value={x} vertical={false} />
      </div>
      <span className="stick-label" aria-hidden="true">
        {t[upDown]} · {t[across]}
      </span>
    </div>
  );
}

/**
 * The two sticks of a mode 2 radio, for the drawing field's lower corners: left is throttle (up and
 * down) and yaw (across), right is pitch and roll. Throttle stays where it is put, like a real
 * radio's; the other axes spring back to centre.
 */
export function Sticks({ flight }: { flight: Flight }) {
  // A key released or a drag ended outside the page never reaches the sticks: when the window
  // loses focus or the page is hidden, let the spring axes go (throttle stays, as on a radio).
  useEffect(() => {
    const letGo = () => {
      const { yaw, pitch, roll } = flight.sticks;
      if (yaw !== 0 || pitch !== 0 || roll !== 0) {
        flight.setSticks({ yaw: 0, pitch: 0, roll: 0 }, 'user');
      }
    };
    const onVisibility = () => {
      if (document.hidden) letGo();
    };
    window.addEventListener('blur', letGo);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('blur', letGo);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [flight]);
  const sticks = useSyncExternalStore(
    (listener) => flight.onWake(listener),
    () => flight.sticks,
  );
  return (
    <div className="sticks">
      <Stick flight={flight} sticks={sticks} side="left" across="yaw" upDown="throttle" />
      <Stick flight={flight} sticks={sticks} side="right" across="roll" upDown="pitch" />
    </div>
  );
}
