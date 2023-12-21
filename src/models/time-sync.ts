import moment = require('moment');

import {STRINGS} from '../config';

import {ERRORS} from '../util/errors';
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
   * Normalize time per given second.
   */
  private normalizeTimePerSecond = (currentRoundMoment: string, i: number) => {
    const thisMoment = moment(currentRoundMoment).milliseconds(0);

    return thisMoment.add(i, 'second');
  };

  /**
   * Input flattener.
   */
  private flattenInput(
    input: ModelParams,
    dealer: UnitsDealerUsage,
    i: number
  ) {
    const inputKeys = Object.keys(input) as UnitKeyName[];
    return inputKeys.reduce((acc, key) => {
      const method = dealer.askToGiveMethodFor(key);

      if (key === 'timestamp') {
        const perSecond = this.normalizeTimePerSecond(input.timestamp, i);
        acc[key] = moment(perSecond).milliseconds(0).toISOString();

        return acc;
      }

      if (key === 'duration') {
        acc[key] = 1; /** @todo use user defined resolution later */

        return acc;
      }
      acc[key] =
        method === 'sum'
          ? this.convertPerInterval(input[key], input['duration'])
          : input[key];

      return acc;
    }, {} as ModelParams);
  }

  /**
   * Populates object to fill the gaps in observation timeline.
   */
  private inputFiller(
    input: ModelParams,
    missingTimestamp: number,
    dealer: UnitsDealerUsage
  ) {
    const metrics = Object.keys(input) as UnitKeyName[];

    return metrics.reduce((acc, metric) => {
      if (metric === 'timestamp') {
        acc[metric] = moment(missingTimestamp).milliseconds(0).toISOString();

        return acc;
      }

      if (metric === 'duration') {
        acc[
          metric
        ] = 1; /** @todo later will be changed to user defined interval */

        return acc;
      }

      if (metric === 'time-reserved') {
        acc[metric] = acc['duration'];

        return acc;
      }

      const method = dealer.askToGiveMethodFor(metric);
      acc[metric] =
        method === 'sum'
          ? this.convertPerInterval(input[metric], input['duration'])
          : input[metric];

      return acc;
    }, {} as ModelParams);
  }

  /**
   * Validates `startTime`, `endTime` and `interval` params.
   */
  private validateParams() {
    if (!this.startTime || !this.endTime) {
      throw new InputValidationError(INVALID_TIME_NORMALIZATION);
    }

    if (this.startTime > this.endTime) {
      throw new InputValidationError(INVALID_TIME_NORMALIZATION);
    }

    if (!this.interval) {
      throw new InputValidationError(INVALID_TIME_INTERVAL);
    }
  }

  /**
   * Normalizes provided time window according to time configuration.
   */
  async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    this.validateParams();

    const dealer = await UnitsDealer();

    return inputs
      .reduce((acc, input, index) => {
        const currentMoment = moment(input.timestamp);

        /**
         * Checks if not the first input, then check consistency with previous ones.
         */
        if (index > 0) {
          const previousInput = inputs[index - 1];
          const previousInputTimestamp = moment(previousInput.timestamp);
          const compareableTime = previousInputTimestamp.add(
            previousInput.duration,
            'second'
          );

          const timelineGapSize = currentMoment.diff(compareableTime, 'second');

          /**
           * Checks if there is gap in timeline.
           */
          if (timelineGapSize > 0) {
            for (
              let missingTimestamp = compareableTime.valueOf();
              missingTimestamp <= currentMoment.valueOf() - 1000;
              missingTimestamp += 1000
            ) {
              const filledGap = this.inputFiller(
                input,
                missingTimestamp,
                dealer
              );
              acc.push(filledGap);
            }
          }
        }

        /**
         * Brake down current observation.
         */
        for (let i = 0; i < input.duration; i++) {
          const normalizedInput = this.flattenInput(input, dealer, i);

          acc.push(normalizedInput);
        }

        return acc;
      }, [] as ModelParams[])
      .sort((a, b) => moment(a.timestamp).diff(moment(b.timestamp)));
  }
}
