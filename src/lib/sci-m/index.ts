import {IImpactModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair} from '../../types/common';

const {MODEL_IDS} = CONFIG;
const {SCI_M} = MODEL_IDS;

export class SciMModel implements IImpactModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  async calculate(observations: object | object[] | undefined): Promise<any[]> {
    if (!Array.isArray(observations)) {
      throw new Error('observations should be an array');
    }

    const tunedObservations = observations.map((observation: KeyValuePair) => {
      // te or total-embodied-emissions: Total embodied emissions of some underlying hardware.
      // tir or time-reserved: The length of time the hardware is reserved for use by the software.
      // el or expected-lifespan: The anticipated time that the equipment will be installed.
      // rr or resources-reserved: The number of resources reserved for use by the software. (e.g. number of vCPUs you are using)
      // tor or total-resources: The total number of resources available (e.g. total number of vCPUs for underlying hardware)
      let te = 0.0;
      let tir = 0.0;
      let el = 0.0;
      let rr = 0.0;
      let tor = 0.0;
      if (
        !(
          'total-embodied-emissions' in observation ||
          'total-embodied-emissions' in observation
        )
      ) {
        throw new Error(
          'total-embodied-emissions is missing. Provide in gCO2e'
        );
      }
      if (!('time-reserved' in observation || 'time-reserved' in observation)) {
        throw new Error('time-reserved is missing. Provide in seconds');
      }
      if (
        !(
          'expected-lifespan' in observation ||
          'expected-lifespan' in observation
        )
      ) {
        throw new Error('expected-lifespan is missing. Provide in seconds');
      }
      if (
        !(
          'resources-reserved' in observation ||
          'resources-reserved' in observation
        )
      ) {
        throw new Error('resources-reserved is missing. Provide as a count');
      }
      if (
        !('total-resources' in observation || 'total-resources' in observation)
      ) {
        throw new Error(
          'total-resources: total-resources is missing. Provide as a count'
        );
      }
      if (
        ('total-embodied-emissions' in observation ||
          'total-embodied-emissions' in observation) &&
        ('time-reserved' in observation || 'time-reserved' in observation) &&
        ('expected-lifespan' in observation || 'expected-lifespan') &&
        ('resources-reserved' in observation || 'resources-reserved') &&
        ('total-resources' in observation || 'total-resources' in observation)
      ) {
        observation['total-embodied-emissions'] =
          observation['total-embodied-emissions'] ??
          observation['total-embodied-emissions'];
        observation['time-reserved'] =
          observation['time-reserved'] ?? observation['time-reserved'];
        observation['expected-lifespan'] =
          observation['expected-lifespan'] ?? observation['expected-lifespan'];
        observation['resources-reserved'] =
          observation['resources-reserved'] ??
          observation['resources-reserved'];
        observation['total-resources'] =
          observation['total-resources'] ?? observation['total-resources'];
        if (typeof observation['total-embodied-emissions'] === 'string') {
          te = parseFloat(observation[observation['total-embodied-emissions']]);
        } else if (
          typeof observation['total-embodied-emissions'] === 'number'
        ) {
          te = observation['total-embodied-emissions'];
        } else {
          te = parseFloat(observation['total-embodied-emissions']);
        }
        if (typeof observation['time-reserved'] === 'string') {
          tir = parseFloat(observation[observation['time-reserved']]);
        } else if (typeof observation['time-reserved'] === 'number') {
          tir = observation['time-reserved'];
        } else {
          tir = parseFloat(observation['time-reserved']);
        }
        if (typeof observation['expected-lifespan'] === 'string') {
          el = parseFloat(observation[observation['expected-lifespan']]);
        } else if (typeof observation['expected-lifespan'] === 'number') {
          el = observation['expected-lifespan'];
        } else {
          el = parseFloat(observation['expected-lifespan']);
        }
        if (typeof observation['resources-reserved'] === 'string') {
          rr = parseFloat(observation[observation['resources-reserved']]);
        } else if (typeof observation['resources-reserved'] === 'number') {
          rr = observation['resources-reserved'];
        } else {
          rr = parseFloat(observation['resources-reserved']);
        }
        if (typeof observation['total-resources'] === 'string') {
          tor = parseFloat(observation[observation['total-resources']]);
        } else if (typeof observation['total-resources'] === 'number') {
          tor = observation['total-resources'];
        } else {
          tor = parseFloat(observation['total-resources']);
        }
        // M = TE * (TiR/EL) * (RR/ToR)
        observation['embodied-carbon'] = te * (tir / el) * (rr / tor);
      }
      return observation;
    });

    return tunedObservations;
  }

  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IImpactModelInterface> {
    this.staticParams = staticParams;
    this.name = name;
    return this;
  }

  modelIdentifier(): string {
    return SCI_M;
  }
}
