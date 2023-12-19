import moment = require('moment');

import {ERRORS} from '../util/errors';

import {STRINGS} from '../config';

import {UnitsDealer} from '../util/units-dealer';

import {ModelParams, ModelPluginInterface} from '../types/model-interface';
import {TimeNormalizerConfig} from '../types/time-sync';
import {UnitsDealerUsage} from '../types/units-dealer';
import {UnitKeyName} from '../types/units';

const {InputValidationError} = ERRORS;

const {INVALID_TIME_NORMALIZATION, INVALID_TIME_INTERVAL} = STRINGS;

export class TimeSyncModel implements ModelPluginInterface {
  startTime: string | undefined;
  endTime: string | undefined;
  interval = 1;

  /**
   * Setups basic configuration.
   */
  async configure(params: TimeNormalizerConfig): Promise<ModelPluginInterface> {
    this.startTime = params['start-time'];
    this.endTime = params['end-time'];
    this.interval = params.interval;

    return this;
  }

  /**
   * Calculates minimal factor.
   */
  private convertPerInterval = (value: number, duration: number) =>
    value / duration;

  /**
   * Input flattener.
   */
  private flattenInput = (
    input: ModelParams,
    dealer: UnitsDealerUsage,
    i: number
  ) => {
    const inputKeys = Object.keys(input) as UnitKeyName[];

    return inputKeys.reduce((acc, key) => {
      const method = dealer.askToGiveUnitFor(key);

      if (key === 'timestamp') {
        const perSecond = this.normalizeTimePerSecond(input.timestamp, i);
        acc[key] = moment(perSecond).toISOString();

        return acc;
      }

      if (key === 'duration') {
        acc[key] = 1; // @todo use user defined resolution later
      }

      acc[key] =
        method === 'sum'
          ? this.convertPerInterval(input[key], input['duration'])
          : input[key];

      return acc;
    }, {} as ModelParams);
  };

  /**
   * Normalize time per given second.
   */
  private normalizeTimePerSecond = (currentRoundMoment: string, i: number) => {
    const thisMoment = moment(currentRoundMoment).milliseconds(0);

    return thisMoment.add(i, 'second');
  };

  /**
   * Normalizes provided time window according to time configuration.
   */
  async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    const {startTime, endTime, interval} = this;

    if (!startTime || !endTime) {
      throw new InputValidationError(INVALID_TIME_NORMALIZATION);
    }

    if (startTime > endTime) {
      throw new InputValidationError(INVALID_TIME_NORMALIZATION);
    }

    if (!interval) {
      throw new InputValidationError(INVALID_TIME_INTERVAL);
    }

    const newInputs: ModelParams[] = [];
    const dealer = await UnitsDealer(); // 😎

    inputs.forEach((input, index) => {
      input.carbon = input['operational-carbon'] + input['embodied-carbon']; // @todo: this should be handled in appropriate layer
      const currentMoment = moment(input.timestamp);

      /**
       * Check if not the first input, then check consistency with previous ones.
       */
      if (index > 0) {
        const previousInput = inputs[index - 1];
        const previousInputTimestamp = moment(previousInput.timestamp);
        const compareableTime = previousInputTimestamp.add(
          previousInput.duration,
          'second'
        );

        const timelineGapSize = currentMoment.diff(compareableTime, 'second');

        if (timelineGapSize > 0) {
          for (
            let missingTimestamp = compareableTime.valueOf();
            missingTimestamp <= currentMoment.valueOf() - 1000;
            missingTimestamp += 1000
          ) {
            // fill the missing values here
            const fillObject = {
              timestamp: moment(missingTimestamp).toISOString(), // whatever the right timestamp is for the 1 s interval
              duration: 1,
              'cpu-util': 0, // if aggregation method is sum or avg, set value to 0
              requests: 0, // if value not in units.yaml assume it should bet set to 0
              'thermal-design-power': 65, // if aggregation method = none, copy value as-is
              'total-embodied-emissions': 251000, // if aggregation method = none, copy value as-is
              'time-reserved': 1, // set to duration
              'expected-lifespan': 126144000, // if aggregation method = none, copy value as-is
              'resources-reserved': 1, // if aggregation method = none, copy value as-is
              'total-resources': 1, // if aggregation method = none, copy value as-is
              'grid-carbon-intensity': 457, // if aggregation method = none, copy value as-is
              'energy-cpu': 0, // if aggregation method is sum or avg, set value to 0
              energy: 0, // if aggregation method is sum or avg, set value to 0
              'embodied-carbon': 0, // if aggregation method is sum or avg, set value to 0
              'operational-carbon': 0, // if aggregation method is sum or avg, set value to 0
              carbon: 0, // if aggregation method is sum or avg, set value to 0
            };

            newInputs.push(fillObject);
          }
        }
      }

      /**
       * Brake down current observation.
       */
      for (let i = 0; i < input.duration; i++) {
        const normalizedInput = this.flattenInput(input, dealer, i);

        newInputs.push(normalizedInput);
      }
    });

    // sort data into time order by UNX timestamp
    newInputs.sort((a, b) => moment(a.timestamp).diff(moment(b.timestamp))); // b - a for reverse sort

    return newInputs;
  }
}
