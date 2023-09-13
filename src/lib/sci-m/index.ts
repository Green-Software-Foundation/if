import {IImpactModelInterface} from '../interfaces';
import {KeyValuePair} from '../../types/boavizta';

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
    observations.map((observation: KeyValuePair) => {
      // te or total-embodied: Total embodied emissions of some underlying hardware.
      // tir or time-reserved: The length of time the hardware is reserved for use by the software.
      // el or expected-lifespan: The anticipated time that the equipment will be installed.
      // rr or resources-reserved: The number of resources reserved for use by the software. (e.g. number of vCPUs you are using)
      // tor or total-resources: The total number of resources available (e.g. total number of vCPUs for underlying hardware)
      let te = 0.0;
      let tir = 0.0;
      let el = 0.0;
      let rr = 0.0;
      let tor = 0.0;
      if (!('te' in observation || 'total-embodied' in observation)) {
        throw new Error('te: total-embodied is missing. Provide in gCO2e');
      }
      if (!('tir' in observation || 'time-reserved' in observation)) {
        throw new Error('tir: time-reserved is missing. Provide in seconds');
      }
      if (!('el' in observation || 'expected-lifespan' in observation)) {
        throw new Error('el: expected-lifespan is missing. Provide in seconds');
      }
      if (!('rr' in observation || 'resources-reserved' in observation)) {
        throw new Error(
          'rr: resources-reserved is missing. Provide as a count'
        );
      }
      if (!('tor' in observation || 'total-resources' in observation)) {
        throw new Error('tor: total-resources is missing. Provide as a count');
      }
      if (
        ('te' in observation || 'total-embodied' in observation) &&
        ('tir' in observation || 'time-reserved' in observation) &&
        ('el' in observation || 'expected-lifespan') &&
        ('rr' in observation || 'resources-reserved') &&
        ('tor' in observation || 'total-resources' in observation)
      ) {
        observation['te'] = observation['te'] ?? observation['total-embodied'];
        observation['tir'] = observation['tir'] ?? observation['time-reserved'];
        observation['el'] =
          observation['el'] ?? observation['expected-lifespan'];
        observation['rr'] =
          observation['rr'] ?? observation['resources-reserved'];
        observation['tor'] =
          observation['tor'] ?? observation['total-resources'];
        if (typeof observation['te'] === 'string') {
          te = parseFloat(observation[observation['te']]);
        } else if (typeof observation['te'] === 'number') {
          te = observation['te'];
        } else {
          te = parseFloat(observation['te']);
        }
        if (typeof observation['tir'] === 'string') {
          tir = parseFloat(observation[observation['tir']]);
        } else if (typeof observation['tir'] === 'number') {
          tir = observation['tir'];
        } else {
          tir = parseFloat(observation['tir']);
        }
        if (typeof observation['el'] === 'string') {
          el = parseFloat(observation[observation['el']]);
        } else if (typeof observation['el'] === 'number') {
          el = observation['el'];
        } else {
          el = parseFloat(observation['el']);
        }
        if (typeof observation['rr'] === 'string') {
          rr = parseFloat(observation[observation['rr']]);
        } else if (typeof observation['rr'] === 'number') {
          rr = observation['rr'];
        } else {
          rr = parseFloat(observation['rr']);
        }
        if (typeof observation['tor'] === 'string') {
          tor = parseFloat(observation[observation['tor']]);
        } else if (typeof observation['tor'] === 'number') {
          tor = observation['tor'];
        } else {
          tor = parseFloat(observation['tor']);
        }
        // M = TE * (TiR/EL) * (RR/ToR)
        observation['embodied-carbon'] = te * (tir / el) * (rr / tor);
      }
      return observation;
    });

    return Promise.resolve(observations);
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
    return 'org.gsf.sci-m';
  }
}
