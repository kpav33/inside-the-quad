import { motorSizeCode, propSizeCode, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

/** Key numbers of the whole reference drone, for the overview sheet's title block. */
export function overviewSpecs(): { label: string; value: string }[] {
  const { frame, motor } = REFERENCE_5_INCH;
  return [
    { label: 'Wheelbase', value: `${frame.wheelbaseMm} mm` },
    { label: 'Motors', value: `${motorSizeCode(REFERENCE_5_INCH)}, ${motor.kv} KV` },
    { label: 'Battery', value: `${motor.batteryCells}S` },
    { label: 'Props', value: propSizeCode(REFERENCE_5_INCH) },
  ];
}
