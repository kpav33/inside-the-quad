import { type ChargerPartId, GEAR } from '@/content/gear';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { DrawnPart } from './DrawnPart';
import { cellFill, chargerCells, type GearState } from './gear-state';

const label = (id: ChargerPartId) => GEAR.charger.parts.find((part) => part.id === id)?.label ?? id;

const CELLS = REFERENCE_5_INCH.motor.batteryCells;
/** The cell bars' box inside the pack. */
const BAR = { top: 102, height: 104, width: 14, gap: 6, left: 244 };

/** The charger and this drone's pack: both leads, and a bar per cell showing its voltage. */
export function ChargerDrawing({
  state,
  highlight,
  onHighlight,
}: {
  state: Extract<GearState, { gear: 'charger' }>;
  highlight: string | null;
  onHighlight: (part: string | null) => void;
}) {
  const shared = { highlight, onHighlight };
  const { cellVolts, packVolts } = chargerCells(state.mode, CELLS);
  const fill = cellFill(cellVolts);
  const barsRight = BAR.left + CELLS * (BAR.width + BAR.gap) - BAR.gap;
  return (
    <>
      <rect className="gear-body" x="36" y="92" width="156" height="120" rx="8" />
      <rect className="gear-body" x="232" y="88" width={barsRight - 220} height="132" rx="6" />
      <DrawnPart
        id="screen"
        label={label('screen')}
        anchor={[60, 106]}
        labelAt={[24, 60]}
        {...shared}
      >
        <rect x="52" y="106" width="124" height="54" rx="2" />
        <text className="gear-screen-text" x="62" y="128">
          {state.mode === 'charge' ? 'Charge' : 'Storage'}
        </text>
        <text className="gear-screen-text" x="62" y="148">
          {`${String(CELLS)}S ${String(packVolts)} V`}
        </text>
      </DrawnPart>
      <DrawnPart
        id="balance-port"
        label={label('balance-port')}
        anchor={[160, 196]}
        labelAt={[200, 284]}
        align="middle"
        {...shared}
      >
        <rect x="140" y="184" width="40" height="12" rx="1" />
      </DrawnPart>
      <DrawnPart
        id="main-lead"
        label={label('main-lead')}
        anchor={[70, 240]}
        labelAt={[24, 284]}
        {...shared}
      >
        <polyline points="70,212 70,248 252,248 252,220" />
      </DrawnPart>
      <DrawnPart
        id="balance-lead"
        label={label('balance-lead')}
        anchor={[212, 140]}
        labelAt={[232, 52]}
        {...shared}
      >
        <polyline points="168,184 168,170 212,170 212,72 300,72 300,88" />
      </DrawnPart>
      <DrawnPart
        id="cells"
        label={label('cells')}
        anchor={[barsRight - 7, 206]}
        labelAt={[376, 284]}
        align="end"
        {...shared}
      >
        {Array.from({ length: CELLS }, (_, i) => {
          const x = BAR.left + i * (BAR.width + BAR.gap);
          const height = BAR.height * fill;
          return (
            <g key={i} data-volts={String(cellVolts)}>
              <rect x={x} y={BAR.top} width={BAR.width} height={BAR.height} />
              <rect
                className="gear-cell-fill"
                x={x}
                y={BAR.top + BAR.height - height}
                width={BAR.width}
                height={height}
              />
            </g>
          );
        })}
      </DrawnPart>
    </>
  );
}
