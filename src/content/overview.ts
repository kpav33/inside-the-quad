import { motorSizeCode, propSizeCode, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

/** Key numbers of the whole reference drone, for the overview sheet's title block. */
export function overviewSpec(): string {
  const { frame, motor } = REFERENCE_5_INCH;
  return [
    `${frame.wheelbaseMm} mm wheelbase`,
    `${motorSizeCode(REFERENCE_5_INCH)} ${motor.kv} KV motors`,
    `${motor.batteryCells}S`,
    `${propSizeCode(REFERENCE_5_INCH)} props`,
  ].join(' · ');
}
