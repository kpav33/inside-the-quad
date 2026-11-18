import type { ReactNode } from 'react';

type Point = readonly [x: number, y: number];

export interface DrawnPartProps {
  id: string;
  label: string;
  /** Where the leader touches the part. */
  anchor: Point;
  /** Where the label sits; the leader runs from the anchor to it. */
  labelAt: Point;
  align?: 'start' | 'middle' | 'end';
  highlight: string | null;
  onHighlight: (part: string | null) => void;
  children: ReactNode;
}

/**
 * One named part of a gear drawing: its shapes, a leader from it, and its label. The mouse over
 * it, or a tap, highlights it; the sheet's list of parts does the same for the keyboard.
 */
export function DrawnPart({
  id,
  label,
  anchor,
  labelAt,
  align = 'start',
  highlight,
  onHighlight,
  children,
}: DrawnPartProps) {
  // The leader stops short of the label, which sits just past its end.
  const below = labelAt[1] > anchor[1];
  return (
    <g
      className="gear-part"
      data-part={id}
      data-highlight={String(highlight === id)}
      onMouseEnter={() => {
        onHighlight(id);
      }}
      onMouseLeave={() => {
        onHighlight(null);
      }}
      onClick={() => {
        onHighlight(id);
      }}
    >
      {children}
      <line
        className="gear-leader"
        x1={anchor[0]}
        y1={anchor[1]}
        x2={labelAt[0]}
        y2={labelAt[1] + (below ? -16 : 4)}
      />
      <circle className="gear-leader-dot" cx={anchor[0]} cy={anchor[1]} r="2" />
      <text x={labelAt[0]} y={labelAt[1] + (below ? 0 : -2)} textAnchor={align}>
        {label}
      </text>
    </g>
  );
}
