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
    value / duration;

  private flattenInput = (
    input: ModelParams,
    arrivedDealer: AsyncReturnType<typeof UnitsDealer>,
    i: number
  ) => {
    const inputKeys = Object.keys(input) as UnitKeyName[];

    return inputKeys.reduce((acc, key) => {
      const method = arrivedDealer.askToGiveUnitFor(key);

      // @ts-ignore
      if (key === 'timestamp') {
        // @ts-ignore
        acc[key] = new Date(i).toISOString();
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
    console.log('IN EXECUTE');
    if (!startTime || !endTime) {
      throw new InputValidationError(INVALID_TIME_NORMALIZATION);
    }

    if (startTime > endTime) {
      throw new InputValidationError(INVALID_TIME_NORMALIZATION);
    }

    if (!interval) {
      throw new InputValidationError(INVALID_TIME_INTERVAL);
    }

    const arrivedDealer = await UnitsDealer(); // 😎
    const newInputs = inputs.reduce((acc, input) => {
      input.carbon = input['operational-carbon'] + input['embodied-carbon']; // @todo: this should be handled in appropriate layer
      const unixStartTimeForObservation = new Date(input.timestamp).getTime();

      ////////////////////////////////////////////////////////////////////////////////////////////
      // PROBLEM - this loop is getting executed multiple times when it should only be called once
      ////////////////////////////////////////////////////////////////////////////////////////////
      // here we actually want to iterate between current timestamp and current timestamp + duration in units of 1 second, niot from start -> end
      // for (let i = unixStartTime; i <= unixEndTime; i += 1000) {
      //   const currentValue = this.flattenInput(input, arrivedDealer, i);

      //   // @ts-ignore
      //   acc.push(currentValue);
      // }
      for (
        let i = unixStartTimeForObservation;
        i <= unixStartTimeForObservation + input.duration * 1000;
        i += 1000
      ) {
        const currentValue = this.flattenInput(input, arrivedDealer, i);

        // @ts-ignore
        acc.push(currentValue);
      }

      return acc;
    }, [] as ModelParams[]);

    return newInputs;
  }
}
