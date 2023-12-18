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
   * Checks if global timeslot has intersection with observation timestamps.
   */
  // private checkIfThereIsIntersection = () => {};

  private flattenInput = (
    input: ModelParams,
    dealer: UnitsDealerUsage,
    i: number
  ) => {
    const inputKeys = Object.keys(input) as UnitKeyName[];

    return inputKeys.reduce((acc, key) => {
      const method = dealer.askToGiveUnitFor(key);

      if (key === 'timestamp') {
        acc[key] = (
          parseFloat(input.timestamp) -
          (parseFloat(input.timestamp) % 1000) +
          i * 1000
        ) // trimming to get whole seconds
          .toString();

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

  // private fillMissingInput(input: ModelParams, dealer: UnitsDealerUsage) {

  // }

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

    const dealer = await UnitsDealer(); // 😎

    const newInputs: ModelParams[] = [];

    inputs.forEach((input, index) => {
      input.carbon = input['operational-carbon'] + input['embodied-carbon']; // @todo: this should be handled in appropriate layer
      input.timestamp = Math.floor(
        new Date(input.timestamp).getTime() / 1000
      ).toString();

      /**
       * Check if not the first input, then check consistency with previous ones.
       */
      if (index > 0) {
        const previousInput = inputs[index - 1];
        const previousInputTimestamp = parseInt(previousInput.timestamp);
        const compareableTime = previousInputTimestamp + previousInput.duration;

        console.log(previousInputTimestamp);
        console.log(compareableTime);
        console.log(parseInt(input.timestamp));

        const currentTimestamp = parseInt(input.timestamp);
        const timelineGapSize = currentTimestamp - compareableTime;

        if (timelineGapSize > 0) {
          for (let i = compareableTime + 1; i <= currentTimestamp; i++) {
            // fill the missing values here
            newInputs.push();
          }

          /**
           * we need to fill the gap
           * @example
           * const fillObject = {
           *  timestamp: 2023-12-12T00:00:00.000Z // whatever the right timestamp is for the 1 s interval
           *  duration: 1
           *  cpu-util: 0 // if aggregation method is sum or avg, set value to 0
           *  requests: 0 // if value not in units.yasml assume it should bet set to 0
           *  thermal-design-power: 65 // if aggregation method = none, copy value as-is
           *  total-embodied-emissions: 251000 // if aggregation method = none, copy value as-is
           *  time-reserved: 1 // set to duration
           *  expected-lifespan: 126144000 // if aggregation method = none, copy value as-is
           *  resources-reserved: 1 // if aggregation method = none, copy value as-is
           *  total-resources: 1 // if aggregation method = none, copy value as-is
           *  grid-carbon-intensity: 457 // if aggregation method = none, copy value as-is
           *  energy-cpu: 0 // if aggregation method is sum or avg, set value to 0
           *  energy: 0 // if aggregation method is sum or avg, set value to 0
           *  embodied-carbon: 0 // if aggregation method is sum or avg, set value to 0
           *  operational-carbon:0 // if aggregation method is sum or avg, set value to 0
           *  carbon: 0 // if aggregation method is sum or avg, set value to 0
           * }
           **/
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
    newInputs.sort((a, b) => parseFloat(a.timestamp) - parseFloat(b.timestamp)); // b - a for reverse sort

    return newInputs;
  }
}
