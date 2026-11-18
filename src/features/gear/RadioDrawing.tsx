import { GEAR, type RadioPartId } from '@/content/gear';

import { DrawnPart } from './DrawnPart';
import type { GearState } from './gear-state';

const label = (id: RadioPartId) => GEAR.radio.parts.find((part) => part.id === id)?.label ?? id;

/** A two-position toggle switch on the radio's top edge, its lever leaning to one side. */
function Lever({ x, toRight, position }: { x: number; toRight: boolean; position: string }) {
  const tip = toRight ? x + 9 : x - 9;
  return (
    <g data-position={position}>
      <rect x={x - 9} y="104" width="18" height="8" rx="2" />
      <line className="gear-lever" x1={x} y1="104" x2={tip} y2="84" />
      <circle className="gear-lever" cx={tip} cy="82" r="3" />
    </g>
  );
}

/** A gimbal: its square opening and the stick at its middle. */
function Gimbal({ cx }: { cx: number }) {
  return (
    <>
      <rect x={cx - 30} y="150" width="60" height="60" rx="6" />
      <line className="gear-faint" x1={cx - 22} y1="180" x2={cx + 22} y2="180" />
      <line className="gear-faint" x1={cx} y1="158" x2={cx} y2="202" />
      <circle cx={cx} cy="180" r="9" />
    </>
  );
}

/** The radio from the front: two gimbals, the arm and mode switches on top, a screen, an antenna. */
export function RadioDrawing({
  state,
  highlight,
  onHighlight,
}: {
  state: Extract<GearState, { gear: 'radio' }>;
  highlight: string | null;
  onHighlight: (part: string | null) => void;
}) {
  const shared = { highlight, onHighlight };
  return (
    <>
      <rect className="gear-body" x="80" y="112" width="240" height="126" rx="22" />
      <DrawnPart
        id="antenna"
        label={label('antenna')}
        anchor={[204, 56]}
        labelAt={[232, 30]}
        {...shared}
      >
        <rect x="198" y="40" width="12" height="72" rx="5" />
      </DrawnPart>
      <DrawnPart
        id="arm-switch"
        label={label('arm-switch')}
        anchor={[104, 92]}
        labelAt={[24, 60]}
        {...shared}
      >
        <Lever x={104} toRight={state.armed} position={state.armed ? 'armed' : 'disarmed'} />
      </DrawnPart>
      <DrawnPart
        id="mode-switch"
        label={label('mode-switch')}
        anchor={[296, 92]}
        labelAt={[376, 60]}
        align="end"
        {...shared}
      >
        <Lever x={296} toRight={state.mode === 'angle'} position={state.mode} />
      </DrawnPart>
      <DrawnPart
        id="screen"
        label={label('screen')}
        anchor={[200, 146]}
        labelAt={[200, 284]}
        align="middle"
        {...shared}
      >
        <rect x="174" y="126" width="52" height="30" rx="2" />
      </DrawnPart>
      <DrawnPart
        id="left-stick"
        label={label('left-stick')}
        anchor={[130, 206]}
        labelAt={[24, 284]}
        {...shared}
      >
        <Gimbal cx={130} />
      </DrawnPart>
      <DrawnPart
        id="right-stick"
        label={label('right-stick')}
        anchor={[270, 206]}
        labelAt={[376, 284]}
        align="end"
        {...shared}
      >
        <Gimbal cx={270} />
      </DrawnPart>
    </>
  );
}
