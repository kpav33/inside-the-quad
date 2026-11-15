import { UI } from '@/content/ui';
import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { LIPO_CELL_VOLTS, packVolts } from '@/shared/domain/lipo';

import type { PathContent } from './types';

const { battery, esc, fc, motor } = REFERENCE_5_INCH;
const becVolts = fc.becVolts.map((volts) => `${volts} V`).join(' and ');

export const powerPath: PathContent = {
  id: 'power',
  title: UI.paths.title.power,
  lead: 'Where the battery’s energy goes: most to the motors, a little to the electronics.',
  from: 'Battery',
  to: 'Motors and electronics',
  carries: 'Electrical power',
  stops: [
    {
      name: 'Battery',
      parts: ['battery'],
      anchors: ['battery'],
      feeds: [1],
      text: `The ${motor.batteryCells}S LiPo holds the energy for the whole flight: ${packVolts(motor.batteryCells, LIPO_CELL_VOLTS.nominal)} V nominal.`,
    },
    {
      name: 'XT60 plug and capacitor',
      parts: ['battery', 'esc'],
      anchors: ['xt60', 'capacitor'],
      feeds: [2],
      text: `The battery’s ${battery.connector} plug joins the ESC’s power lead. A ${esc.capacitorUf} µF capacitor there soaks up voltage spikes before they reach the electronics.`,
    },
    {
      name: 'ESC',
      parts: ['esc'],
      anchors: ['esc'],
      feeds: [3, 4],
      text: 'Battery power arrives at the ESC first. It sends most of it on to the motors, and passes some up to the flight controller.',
    },
    {
      name: 'Motors',
      parts: ['motors'],
      anchors: ['motors'],
      feeds: [],
      text: `The motors take almost all of the power. The ESC is rated for ${esc.currentPerMotorA} A per motor; how much they actually draw depends on the throttle and the props.`,
    },
    {
      name: 'Flight controller’s regulators',
      parts: ['fc'],
      anchors: ['fc'],
      feeds: [5],
      text: `Small regulators (BECs) on the flight controller turn the battery voltage down to the ${becVolts} the smaller electronics need.`,
    },
    {
      name: 'Receiver, camera and VTX',
      parts: ['receiver', 'camera', 'vtx'],
      anchors: ['receiver', 'camera', 'vtx'],
      feeds: [],
      text: 'They run from the flight controller’s regulated power, not straight from the battery.',
    },
  ],
};
