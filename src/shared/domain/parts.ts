/** The drone parts the app can explain. Selecting one selects every instance of it. */
export const PART_IDS = ['frame', 'motors', 'props', 'esc', 'battery'] as const;

export type PartId = (typeof PART_IDS)[number];
