import type { MoveStepId } from '@/shared/domain/moves';
import type { PartId } from '@/shared/domain/parts';

/** One step of the moves sheet: what to try, and what happens. */
export interface MoveStep {
  name: string;
  text: string;
  /** Lessons that say more, linked quietly under the text. */
  lessons: readonly PartId[];
}

export interface MovesContent {
  title: string;
  /** One line under the heading. */
  lead: string;
  /** The title block's values in place of a part's spec. */
  facts: readonly { label: string; value: string }[];
  steps: Record<MoveStepId, MoveStep>;
}

/**
 * How a quad moves: four motor speeds are all it steers with. Every claim here agrees with the
 * motors, props and flight controller lessons and the intro ("let go and it keeps the angle").
 */
export const MOVES: MovesContent = {
  title: 'How a quad moves',
  lead: 'A quad has no wings or rudder. It steers by changing the speed of its four motors. Move the sticks and watch.',
  facts: [
    { label: 'Mode', value: 'Acro' },
    { label: 'Motors', value: '4, props in' },
    { label: 'Speed', value: 'About 7× slower than real' },
  ],
  steps: {
    throttle: {
      name: 'Throttle: up and down',
      text: 'Push the left stick up and all four motors speed up together. More thrust than the drone weighs lifts it; less lets it sink. The motors never stop while the drone is armed: at zero throttle they still turn slowly.',
      lessons: ['motors'],
    },
    roll: {
      name: 'Roll: tilt sideways',
      text: 'Push the right stick right. The left motors speed up and the right motors slow down, so the left side lifts and the drone rolls right. Hold the stick and it keeps rolling, all the way round if you let it. Centre the stick and it stops, at whatever angle it has reached.',
      lessons: ['motors'],
    },
    pitch: {
      name: 'Pitch: tip forward and back',
      text: 'Push the right stick up. The rear motors speed up and the front motors slow down, so the nose tips down. Tilted, the thrust points partly forward, and that is what moves a real drone forward. Pull back and the opposite happens.',
      lessons: ['motors'],
    },
    yaw: {
      name: 'Yaw: turn on the spot',
      text: 'Push the left stick right. Each prop twists the drone the opposite way to its spin. Normally the two clockwise and two counter-clockwise props cancel out. Speed up the counter-clockwise pair and slow the clockwise pair, and their twist wins: the drone turns clockwise, to the right, without tilting.',
      lessons: ['props'],
    },
    gyro: {
      name: 'Gyro loop: staying where you put it',
      text: 'Press Gust to knock the drone. Thousands of times a second, the flight controller compares the rotation you ask for with what the gyro measures, and changes the motor speeds to close the gap. That is why the drone comes back to the angle it was holding. Without this loop, no quad could fly.',
      lessons: ['fc'],
    },
  },
};
