import {ERRORS} from '../util/errors';

import {STRINGS} from '../config';

import {ModelParams, ModelPluginInterface} from '../types/model-interface';
import {TimeNormalizerConfig} from '../types/time-sync';
import {UnitsDealer} from '../util/unit-dealer';
import {UnitKeyName} from '../types/units';
import {AsyncReturnType} from '../types/helpers';

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
    dealer: AsyncReturnType<typeof UnitsDealer>,
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

    inputs.forEach(input => {
      input.carbon = input['operational-carbon'] + input['embodied-carbon']; // @todo: this should be handled in appropriate layer
      input.timestamp = Math.floor(
        new Date(input.timestamp).getTime() / 1000
      ).toString();

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
