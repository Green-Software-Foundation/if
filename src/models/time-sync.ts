/* eslint-disable @typescript-eslint/ban-ts-comment */
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
    (value / duration) * this.interval;

  private flattenInput = (
    input: ModelParams,
    arrivedDealer: AsyncReturnType<typeof UnitsDealer>,
    i: number
  ) => {
    const inputKeys = Object.keys(input) as UnitKeyName[];

    return inputKeys.reduce((acc, key) => {
      console.log(key);
      const method = arrivedDealer.askToGiveUnitFor(key);

      // @ts-ignore
      if (key === 'timestamp') {
        // @ts-ignore
        acc[key] = new Date(i * 1000).toISOString();

        return acc;
      }

      if (key === 'duration') {
        // @ts-ignore
        acc[key] = this.interval;
      }

      // @ts-ignore
      acc[key] =
        method === 'sum'
          ? this.convertPerInterval(input[key], input['duration'])
          : input[key];

      return acc;
    }, {});
  };

  /**
   * Normalizes provided time window according to time configuration.
   */
  async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    const {startTime, endTime, interval} = this;

    if (!startTime || !endTime) {
      throw new InputValidationError(INVALID_TIME_NORMALIZATION);
    }

    if (!interval) {
      throw new InputValidationError(INVALID_TIME_INTERVAL);
    }

    const arrivedDealer = await UnitsDealer(); // 😎

    const newInputs = inputs.reduce((acc, input) => {
      input.carbon = input['operational-carbon'] + input['embodied-carbon']; // @todo: this should be handled in appropriate layer

      const unixStartTime = Math.floor(new Date(startTime).getTime() / 1000);
      const unixEndTime = Math.floor(new Date(endTime).getTime() / 1000);

      for (let i = unixStartTime; i < unixEndTime; i++) {
        const currentValue = this.flattenInput(input, arrivedDealer, i);

        // @ts-ignore
        acc.push(currentValue);
      }

      return acc;
    }, [] as ModelParams[]);

    const unixStartTime = Math.floor(new Date(startTime).getTime() / 1000);
    const unixEndTime = Math.floor(new Date(endTime).getTime() / 1000);

    for (let i = unixStartTime; i < unixEndTime; i += interval) {
      const timestamp = i.toString();

      if (!newInputs.some(input => input.timestamp === timestamp)) {
        newInputs.push({timestamp, energy: 0, carbon: 0, duration: interval});
      }
    }

    return newInputs;
  }
}
