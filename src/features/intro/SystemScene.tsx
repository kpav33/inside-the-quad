import { type PointerEvent, useState } from 'react';

import { INTRO, type SceneDeviceId, type SceneLinkId } from '@/content/intro';

type Point = readonly [x: number, y: number];

/** Where each link runs in the drawing (viewBox units), from sender to receiver. */
const LINK_PATHS: Record<SceneLinkId, { from: Point; to: Point; label: Point }> = {
  control: { from: [118, 150], to: [290, 106], label: [214, 152] },
  video: { from: [288, 84], to: [84, 122], label: [178, 80] },
};

/** A drawn arrowhead at `to`, pointing away from `from`. */
function arrowHead(from: Point, to: Point, size = 9): string {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const wing = (offset: number) =>
    `${to[0] - size * Math.cos(angle + offset)},${to[1] - size * Math.sin(angle + offset)}`;
  return `${wing(0.45)} ${to[0]},${to[1]} ${wing(-0.45)}`;
}

/**
 * The whole FPV system as a drawing: the pilot with the radio and goggles, the drone, and the two
 * links between them. The list under it carries the same facts for everyone, and its buttons
 * highlight a device and its links in the drawing.
 */
export function SystemScene() {
  const { scene } = INTRO;
  const [selected, setSelected] = useState<SceneDeviceId | null>(null);
  const [hovered, setHovered] = useState<SceneDeviceId | null>(null);
  const active = hovered ?? selected;
  const activeLinks = scene.devices.find((d) => d.id === active)?.links ?? [];

  const toggle = (id: SceneDeviceId) => {
    setSelected((current) => (current === id ? null : id));
  };
  // Hover previews only with a mouse: a tap sends enter events with no matching leave, which
  // would leave a preview stuck on.
  const preview = (id: SceneDeviceId) => ({
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType === 'mouse') setHovered(id);
    },
    onPointerLeave: () => {
      setHovered(null);
    },
  });
  const deviceProps = (id: SceneDeviceId) => ({
    ...preview(id),
    'data-device': id,
    'data-highlight': String(active === id),
    className: 'scene-device',
    onClick: () => {
      toggle(id);
    },
  });

  return (
    <figure className="intro-figure system-scene">
      <svg viewBox="0 0 400 260" aria-hidden="true" focusable="false" className="intro-drawing">
        <line className="scene-ground" x1="16" y1="244" x2="384" y2="244" />

        {/* The pilot is part of the picture, not a device. */}
        <g className="scene-pilot">
          <circle cx="64" cy="132" r="12" />
          <line x1="64" y1="144" x2="64" y2="198" />
          <polyline points="50,242 64,198 78,242" />
          <polyline points="64,158 82,170" />
        </g>

        <g {...deviceProps('goggles')}>
          <rect x="52" y="126" width="24" height="10" />
          <text x="40" y="108">
            {scene.devices[2]?.label}
          </text>
        </g>

        <g {...deviceProps('radio')}>
          <rect x="80" y="162" width="34" height="20" />
          <circle cx="89" cy="172" r="3.5" />
          <circle cx="105" cy="172" r="3.5" />
          <line x1="110" y1="162" x2="116" y2="148" />
          <text x="124" y="190">
            {scene.devices[0]?.label}
          </text>
        </g>

        <g {...deviceProps('drone')}>
          <line x1="286" y1="42" x2="346" y2="102" />
          <line x1="346" y1="42" x2="286" y2="102" />
          {[
            [286, 42],
            [346, 42],
            [286, 102],
            [346, 102],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="16" />
          ))}
          <rect x="304" y="62" width="24" height="20" />
          <text x="316" y="140" textAnchor="middle">
            {scene.devices[1]?.label}
          </text>
        </g>

        {(Object.keys(LINK_PATHS) as SceneLinkId[]).map((id) => {
          const { from, to, label } = LINK_PATHS[id];
          const link = scene.links[id];
          return (
            <g
              key={id}
              className="scene-link"
              data-link={id}
              data-highlight={String(activeLinks.includes(id))}
            >
              <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} />
              <polyline points={arrowHead(from, to)} />
              <text x={label[0]} y={label[1]} textAnchor="middle">
                <tspan className="scene-link-label">{link.label}</tspan>
                <tspan x={label[0]} dy="14">
                  {link.detail}
                </tspan>
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="scene-devices" aria-label={scene.label}>
        {scene.devices.map((device) => (
          <li key={device.id}>
            <button
              type="button"
              className="button-outline scene-device-button"
              aria-pressed={selected === device.id}
              onClick={() => {
                toggle(device.id);
              }}
              {...preview(device.id)}
            >
              {device.label}
            </button>
            <p className="scene-device-role">
              {device.role}{' '}
              <span className="scene-device-links">
                {device.links
                  .map((id) => `${scene.links[id].label}: ${scene.links[id].detail}`)
                  .join(' · ')}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </figure>
  );
}
