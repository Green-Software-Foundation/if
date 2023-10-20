import {IImpactModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair} from '../../types/common';

const {MODEL_IDS} = CONFIG;
const {SCI} = MODEL_IDS;

export class SciModel implements IImpactModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  time: string | unknown;
  functionalUnit = 'none';
  functionalUnitDuration = 1;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  async calculate(observations: object | object[] | undefined): Promise<any[]> {
    if (!Array.isArray(observations)) {
      throw new Error('observations should be an array');
    }

    const tunedObservations = observations.map((observation: KeyValuePair) => {
      if (!('operational-carbon' in observation)) {
        throw new Error('observation missing `operational-carbon`');
      }
      if (!('embodied-carbon' in observation)) {
        throw new Error('observation missing `embodied-carbon`');
      }

      const operational = parseFloat(observation['operational-carbon']);
      const embodied = parseFloat(observation['embodied-carbon']);

      /*
      If `carbon` is in observations, use it.
      If not, calculate it from operational and embodied carbon.
      Divide by observation[duration] to ensure time unit is /s
      */
      let sci_secs = 0;
      if ('carbon' in observation) {
        sci_secs = observation['carbon'] / observation['duration'];
      } else {
        sci_secs = (operational + embodied) / observation['duration']; // sci in time units of /s
      }

      let sci_timed: number = sci_secs;
      let sci_timed_duration = sci_secs;

      /*
      Convert C to desired time unit
      */
      if (
        this.time === 's' ||
        this.time === 'second' ||
        this.time === 'seconds' ||
        this.time === 'secs' ||
        this.time === '' ||
        this.time === null ||
        this.time === 'none'
      ) {
        sci_timed = sci_secs;
      }
      if (
        this.time === 'minute' ||
        this.time === 'minutes' ||
        this.time === 'mins' ||
        this.time === 'm'
      ) {
        sci_timed = sci_secs * 60;
      }
      if (
        this.time === 'hour' ||
        this.time === 'hours' ||
        this.time === 'hr' ||
        this.time === 'h'
      ) {
        sci_timed = sci_secs * 60 * 60;
      }
      if (this.time === 'day' || this.time === 'days' || this.time === 'd') {
        sci_timed = sci_secs * 60 * 60 * 24;
      }
      if (this.time === 'week' || this.time === 'weeks' || this.time === 'd') {
        sci_timed = sci_secs * 60 * 60 * 24 * 7;
      }
      if (this.time === 'month' || this.time === 'months') {
        sci_timed = sci_secs * 60 * 60 * 24 * 7 * 4;
      }
      if (
        this.time === 'year' ||
        this.time === 'years' ||
        this.time === 'yr' ||
        this.time === 'y'
      ) {
        sci_timed = sci_secs * 60 * 60 * 24 * 365;
      }

      /*
      sci currently in whole single units of time - multiply by duration to
      convert to user-defined span of time.
      */
      sci_timed_duration = sci_timed * this.functionalUnitDuration;

      const functionalUnit = this.functionalUnit;

      if (this.functionalUnit !== 'none') {
        const factor = observation[functionalUnit];
        observation['sci'] = sci_timed_duration / factor;
        return observation;
      } else {
        observation['sci'] = sci_timed_duration;
        return observation;
      }
    });

    return tunedObservations;
  }

  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IImpactModelInterface> {
    if (staticParams === undefined) {
      throw new Error('Required Parameters not provided');
    }

    this.staticParams = staticParams;
    this.name = name;

    if ('functional-unit-time' in staticParams) {
      this.time = staticParams['functional-unit-time'] as number;
    }
    if (
      'functional-unit-duration' in staticParams &&
      typeof staticParams['functional-unit-duration'] === 'number'
    ) {
      this.functionalUnitDuration = staticParams['functional-unit-duration'];
    } else {
      throw new Error(
        'Functional unit duration is not a valid number: provide number of seconds represented by observation'
      );
    }
    if (
      'functional-unit' in staticParams &&
      typeof staticParams['functional-unit'] === 'string' &&
      staticParams['functional-unit'] !== ''
    ) {
      this.functionalUnit = staticParams['functional-unit'];
    } else {
      this.functionalUnit = 'none';
    }

    return this;
  }

  modelIdentifier(): string {
    return SCI;
  }
}
