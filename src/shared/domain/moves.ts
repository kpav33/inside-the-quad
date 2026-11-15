/** The sheet after the paths: how four motor speeds steer the drone. */
export const MOVES_SHEET = 'moves' as const;

export type MovesSheet = typeof MOVES_SHEET;

/** The moves sheet's steps, in order. */
export const MOVE_STEP_IDS = ['throttle', 'roll', 'pitch', 'yaw', 'gyro'] as const;

export type MoveStepId = (typeof MOVE_STEP_IDS)[number];
