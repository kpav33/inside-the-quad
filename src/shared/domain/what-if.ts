/** The last sheet of How it works together: common mistakes, acted out on the drawing. */
export const WHAT_IF_SHEET = 'what-if' as const;

export type WhatIfSheet = typeof WHAT_IF_SHEET;

/** The what-if sheet's steps, in order: one mistake each. */
export const WHAT_IF_STEP_IDS = ['failsafe', 'prop', 'battery', 'vtx'] as const;

export type WhatIfStepId = (typeof WHAT_IF_STEP_IDS)[number];
