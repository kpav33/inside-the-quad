import { INTRO } from '@/content/intro';
import {
  drawingSizeMm,
  formatRangeMm,
  SIZE_CLASSES,
  type SizeClass,
} from '@/shared/domain/size-classes';

const GAP_MM = 40;
const LABEL_SPACE_MM = 110;

/** Half the drone's drawn extent: motor offset plus a prop radius. */
function halfExtent(sizeClass: SizeClass): number {
  const propMm = (sizeClass.propMm[0] + sizeClass.propMm[1]) / 2;
  return drawingSizeMm(sizeClass) / (2 * Math.SQRT2) + propMm / 2;
}

const tallest = Math.max(...SIZE_CLASSES.map(halfExtent)) * 2;
const width =
  SIZE_CLASSES.reduce((sum, c) => sum + halfExtent(c) * 2, 0) + GAP_MM * (SIZE_CLASSES.length - 1);

/** Each drone's centre along the row: side by side, GAP_MM apart. */
const placed = SIZE_CLASSES.map((sizeClass, index) => {
  const before = SIZE_CLASSES.slice(0, index).reduce((sum, c) => sum + halfExtent(c) * 2, 0);
  return { sizeClass, cx: before + GAP_MM * index + halfExtent(sizeClass) };
});

/** One drone as a top view, in millimetres, centred on (cx, cy). */
function TopView({ sizeClass, cx, cy }: { sizeClass: SizeClass; cx: number; cy: number }) {
  const offset = drawingSizeMm(sizeClass) / (2 * Math.SQRT2);
  const propR = (sizeClass.propMm[0] + sizeClass.propMm[1]) / 4;
  const body = drawingSizeMm(sizeClass) * 0.16;
  const motors = [
    [cx - offset, cy - offset],
    [cx + offset, cy - offset],
    [cx - offset, cy + offset],
    [cx + offset, cy + offset],
  ] as const;
  return (
    <g data-size={drawingSizeMm(sizeClass)}>
      <line x1={motors[0][0]} y1={motors[0][1]} x2={motors[3][0]} y2={motors[3][1]} />
      <line x1={motors[1][0]} y1={motors[1][1]} x2={motors[2][0]} y2={motors[2][1]} />
      {motors.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={propR} />
      ))}
      <rect x={cx - body / 2} y={cy - body / 2} width={body} height={body} />
    </g>
  );
}

/** The four common sizes drawn to one scale, with the same numbers as a table. */
export function SizeComparison() {
  const { sizes } = INTRO;
  const cy = tallest / 2;

  return (
    <figure className="intro-figure size-comparison">
      <svg
        viewBox={`0 0 ${width} ${tallest + LABEL_SPACE_MM}`}
        aria-hidden="true"
        focusable="false"
        className="intro-drawing"
      >
        {placed.map(({ sizeClass, cx }) => (
          <g key={sizeClass.id} className="size-drone">
            <TopView sizeClass={sizeClass} cx={cx} cy={cy} />
            <text x={cx} y={tallest + 52} textAnchor="middle">
              {sizes.names[sizeClass.id]}
            </text>
            {sizeClass.id === '5in' && (
              <text x={cx} y={tallest + 96} textAnchor="middle" className="size-reference">
                {sizes.reference}
              </text>
            )}
          </g>
        ))}
      </svg>

      <table className="spec-grid size-table" aria-label={sizes.label}>
        <thead>
          <tr>
            <th scope="col">{sizes.columns.size}</th>
            <th scope="col">{sizes.columns.prop}</th>
            <th scope="col">{sizes.columns.frame}</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_CLASSES.map((sizeClass) => (
            <tr key={sizeClass.id}>
              <th scope="row">{sizes.names[sizeClass.id]}</th>
              <td className="spec-grid-value">{formatRangeMm(sizeClass.propMm)}</td>
              <td className="spec-grid-value">{formatRangeMm(sizeClass.frameMm)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
