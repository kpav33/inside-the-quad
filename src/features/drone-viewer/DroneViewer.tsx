import { OrbitControls } from '@react-three/drei';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { useCallback, useMemo, useRef } from 'react';
import { type Group, TOUCH } from 'three';

import {
  DroneModel,
  type Leader,
  leaderMarkerPoints,
  MotorArcs,
  outlineScene,
  type Rect,
} from '@/features/drone-model';
import type { Flight } from '@/features/flight';
import { SCENE_LIGHT } from '@/shared/design/tokens';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import type { PartId } from '@/shared/domain/parts';

import { FitCamera } from './FitCamera';
import { FlightRig, GroundLine, type MotorPinElement, MotorPins, VtxGauge } from './FlightRig';
import { DEFAULT_CAMERA_POSITION } from './part-views';
import { type PinElement, PathPins, ProjectPins } from './PathPins';
import { TouchScrollPassThrough } from './TouchScrollPassThrough';
import { TurnToPart } from './TurnToPart';
import { DRONE_CENTRE } from './useDroneFit';

export interface DroneViewerProps {
  /** Parts in the open look: the open sheet's part, or every part of a path's current stop. */
  openParts: ReadonlySet<PartId>;
  /** Parts the open sheet connects to, drawn in grey. */
  connectedParts: ReadonlySet<PartId>;
  /** Opens the frame like an exploded-view drawing. */
  exploded: boolean;
  /** The part to turn the view toward, or null to leave the view alone. */
  turnTo: PartId | null;
  /** A path drawn over the model, or null. */
  leader: Leader | null;
  /**
   * The moves sheet's drone, or null: when set, the drone turns in place as the flight says, with
   * its motor speeds over the canvas, and the camera fits it at any attitude.
   */
  flight?: Flight | null;
  /**
   * With a flight, how far below hover the drone rests after a fall (metres, the what-if sheet's
   * ground line), or null for no ground (the moves sheet).
   */
  ground?: number | null;
  onPartClick: (part: PartId, event: ThreeEvent<MouseEvent>) => void;
  /** Called with the part under the mouse, and null when the mouse leaves it. */
  onPartHover: (part: PartId | null) => void;
  /** Called when a click hits empty space instead of a part. */
  onBackgroundClick: () => void;
}

/**
 * Interactive 3D viewport for the reference drone. The canvas is hidden from assistive
 * technology: the part list next to it offers the same choices.
 */
export default function DroneViewer({
  openParts,
  connectedParts,
  exploded,
  turnTo,
  leader,
  flight = null,
  ground = null,
  onPartClick,
  onPartHover,
  onBackgroundClick,
}: DroneViewerProps) {
  const pins = useRef<PinElement[]>([]);
  const motorPins = useRef<MotorPinElement[]>([]);
  const pose = useRef<Group>(null);
  const root = useRef<HTMLDivElement>(null);
  // The sticks sit over the canvas (the explorer draws them, marked `data-avoid-pins`); the motor
  // balloons keep clear of them.
  const avoid = useCallback((): Rect[] => {
    const box = root.current?.getBoundingClientRect();
    const area = root.current?.parentElement;
    if (!box || !area) return [];
    return [...area.querySelectorAll('[data-avoid-pins]')].map((element) => {
      const r = element.getBoundingClientRect();
      return {
        left: r.left - box.left,
        right: r.right - box.left,
        top: r.top - box.top,
        bottom: r.bottom - box.top,
      };
    });
  }, []);
  const findGauge = useCallback(
    () => root.current?.querySelector<HTMLElement>('.vtx-gauge') ?? null,
    [],
  );
  const readSpeeds = useCallback(() => flight?.state.motors ?? [], [flight]);
  const outline = useMemo(() => outlineScene(REFERENCE_5_INCH), []);
  const stops = leader?.stops;
  const markerPoints = useMemo(
    () => (stops ? leaderMarkerPoints(REFERENCE_5_INCH, stops) : []),
    [stops],
  );
  return (
    <div className="drone-viewer" ref={root}>
      <Canvas
        aria-hidden="true"
        camera={{ position: DEFAULT_CAMERA_POSITION, fov: 40, near: 0.01, far: 10 }}
        onPointerMissed={onBackgroundClick}
        // Draw only when the camera or selection changes, or while a path's dashes move.
        frameloop="demand"
      >
        {/* A bench lamp from the upper front, with a cool fill so dark parts keep their shape. */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[1, 2, 1.5]} intensity={1.8} />
        <directionalLight position={[-1.5, 0.8, -1]} intensity={0.6} color={SCENE_LIGHT.fill} />
        {flight ? (
          // Turned about the drone's middle: the outer group moves the pivot there, the pose group
          // turns and lifts, the inner group puts the drone back around it.
          <group position={DRONE_CENTRE}>
            <group ref={pose}>
              <group position={[-DRONE_CENTRE[0], -DRONE_CENTRE[1], -DRONE_CENTRE[2]]}>
                <DroneModel
                  spec={REFERENCE_5_INCH}
                  openParts={openParts}
                  connectedParts={connectedParts}
                  exploded={false}
                  onPartClick={onPartClick}
                  onPartHover={onPartHover}
                />
                <MotorArcs spec={REFERENCE_5_INCH} readSpeeds={readSpeeds} idle={flight.idle} />
              </group>
            </group>
          </group>
        ) : (
          <DroneModel
            spec={REFERENCE_5_INCH}
            openParts={openParts}
            connectedParts={connectedParts}
            exploded={exploded}
            leader={leader}
            onPartClick={onPartClick}
            onPartHover={onPartHover}
          />
        )}
        <OrbitControls
          makeDefault
          enablePan={false}
          // One finger scrolls the page (see TouchScrollPassThrough); two fingers turn and zoom.
          touches={{ TWO: TOUCH.DOLLY_ROTATE }}
        />
        {/* Fits the camera to the drone's outline, so it fills the drawing at every canvas shape;
            sets the zoom limits from that distance. */}
        <FitCamera sphere={flight !== null} ground={flight ? ground : null} />
        {flight && ground !== null && <GroundLine ground={ground} />}
        <TouchScrollPassThrough />
        <TurnToPart part={turnTo} />
        {leader && (
          <ProjectPins leader={leader} points={markerPoints} outline={outline} pins={pins} />
        )}
        {flight && (
          <FlightRig flight={flight} pose={pose} pins={motorPins} gauge={findGauge} avoid={avoid} />
        )}
      </Canvas>
      {leader && <PathPins leader={leader} pins={pins} />}
      {flight && <MotorPins pins={motorPins} />}
      {flight && <VtxGauge />}
    </div>
  );
}
