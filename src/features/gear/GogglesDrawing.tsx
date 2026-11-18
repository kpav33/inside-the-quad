import { GEAR, type GogglesPartId } from '@/content/gear';

import { DrawnPart } from './DrawnPart';
import type { GearState } from './gear-state';

const label = (id: GogglesPartId) => GEAR.goggles.parts.find((part) => part.id === id)?.label ?? id;

/** What one screen shows: a simple view ahead (the horizon and a gate), or "No signal". */
function Screen({ x, picture }: { x: number; picture: boolean }) {
  return (
    <g>
      <rect x={x} y="132" width="76" height="50" rx="4" />
      {picture ? (
        <g data-picture="" className="gear-faint">
          <line x1={x + 4} y1="164" x2={x + 72} y2="158" />
          <polyline points={`${x + 26},162 ${x + 26},146 ${x + 50},146 ${x + 50},160`} />
        </g>
      ) : (
        <text className="gear-screen-text" x={x + 38} y="161" textAnchor="middle">
          No signal
        </text>
      )}
    </g>
  );
}

/** The goggles from the wearer's side: two screens, the video receiver bay, antennas, the strap. */
export function GogglesDrawing({
  state,
  highlight,
  onHighlight,
}: {
  state: Extract<GearState, { gear: 'goggles' }>;
  highlight: string | null;
  onHighlight: (part: string | null) => void;
}) {
  const shared = { highlight, onHighlight };
  const picture = state.system === 'analog';
  return (
    <>
      <rect className="gear-body" x="96" y="116" width="208" height="84" rx="26" />
      <DrawnPart
        id="strap"
        label={label('strap')}
        anchor={[52, 158]}
        labelAt={[24, 232]}
        {...shared}
      >
        <path d="M96 146 L40 140 Q22 158 40 176 L96 170" />
        <path d="M304 146 L360 140 Q378 158 360 176 L304 170" />
      </DrawnPart>
      <DrawnPart
        id="screens"
        label={label('screens')}
        anchor={[200, 182]}
        labelAt={[200, 270]}
        align="middle"
        {...shared}
      >
        <Screen x={114} picture={picture} />
        <Screen x={210} picture={picture} />
      </DrawnPart>
      <DrawnPart
        id="video-receiver"
        label={label('video-receiver')}
        anchor={[236, 100]}
        labelAt={[376, 74]}
        align="end"
        {...shared}
      >
        <rect x="170" y="96" width="60" height="20" rx="3" />
      </DrawnPart>
      <DrawnPart
        id="antennas"
        label={label('antennas')}
        anchor={[116, 60]}
        labelAt={[24, 36]}
        {...shared}
      >
        <line x1="128" y1="116" x2="116" y2="60" />
        <circle cx="114" cy="52" r="8" />
        <line x1="272" y1="116" x2="272" y2="84" />
        <rect x="258" y="56" width="28" height="28" rx="3" />
      </DrawnPart>
    </>
  );
}
