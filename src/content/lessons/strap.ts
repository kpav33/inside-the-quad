import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import type { Lesson } from './types';

const { strap } = REFERENCE_5_INCH;

export const strapLesson: Lesson = {
  partId: 'strap',
  title: 'Battery strap',
  whatItDoes:
    'The battery strap and its grippy pad hold the battery firmly on the top plate, so it can’t slide or fly off.',
  howItWorks: [
    'The strap is a short band of tough fabric with a rubber-coated inside and a buckle or hook-and-loop fastening. It wraps around the battery and the top plate and is pulled tight before every flight.',
    'Under the battery sits a thin pad of grippy rubber. It stops the battery sliding forward or sideways in a hard turn or a crash, so the strap doesn’t have to do all the work.',
    'It is a small, cheap part, but it matters: if the battery comes loose in the air, the drone loses power at once and falls. That is a crash, and a battery thrown loose can be damaged and become a fire risk.',
    'Straps wear out. Replace one that is frayed, stretched or has a weak fastening.',
  ],
  specs: [
    {
      label: 'Size',
      value: `${strap.widthMm} × ${strap.lengthMm} mm`,
      meaning:
        'Width and length. It must be long enough to go around the battery and the top plate, and wide enough to grip.',
    },
    {
      label: 'Pad',
      value: 'Rubber',
      meaning: 'A thin grippy pad under the battery that stops it sliding.',
    },
  ],
  connections: [
    { text: 'It wraps around the battery and holds it down.', partId: 'battery' },
    { text: 'It goes around the frame’s top plate, through its strap slots.', partId: 'frame' },
  ],
};
