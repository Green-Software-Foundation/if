import { extendMoment } from 'moment-range';
import { STRINGS } from '../config';
import { ERRORS } from '../util/errors';
import { UnitsDealer } from '../util/units-dealer';
import { ModelParams, ModelPluginInterface } from '../types/model-interface';
import { PaddingReceipt, TimeNormalizerConfig } from '../types/time-sync';
import { UnitsDealerUsage } from '../types/units-dealer';

const moment = require('moment');
const momentRange = extendMoment(moment);

const { InputValidationError } = ERRORS;

const {
  INVALID_TIME_NORMALIZATION,
  INVALID_TIME_INTERVAL,
  INVALID_OBSERVATION_OVERLAP,
  AVOIDING_PADDING_BY_EDGES,
} = STRINGS;

export class TimeSyncModel implements ModelPluginInterface {
  private startTime!: string;
  private endTime!: string;
  private dealer!: UnitsDealerUsage;
  private interval = 1;
  private allowPadding = true;

  /**
   * Setups basic configuration.
   */
  async configure(params: TimeNormalizerConfig): Promise<ModelPluginInterface> {
    this.startTime = params['start-time'];
    this.endTime = params['end-time'];
    this.interval = params.interval;
    this.allowPadding = params['allow-padding'];
    this.dealer = await UnitsDealer();
    return this;
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
   * Barkes down input per minimal time unit.
   */
  private breakDownInput(input: ModelParams, i: number) {
    const inputKeys = Object.keys(input);

    return inputKeys.reduce((acc, key) => {
      const method = this.dealer.askToGiveMethodFor(key);

      if (key === 'timestamp') {
        const perSecond = this.normalizeTimePerSecond(input.timestamp, i);
        acc[key] = moment(perSecond).milliseconds(0).toISOString();

        return acc;
      }

      /** @todo use user defined resolution later */
      if (key === 'duration') {
        acc[key] = 1;

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
   * Populates object to fill the gaps in observational timeline using zeroish values.
   */
  private fillWithZeroishInput(input: ModelParams, missingTimestamp: number) {
    const metrics = Object.keys(input);

    return metrics.reduce((acc, metric) => {
      if (metric === 'timestamp') {
        acc[metric] = moment(missingTimestamp).milliseconds(0).toISOString();

        return acc;
      }

      /** @todo later will be changed to user defined interval */
      if (metric === 'duration') {
        acc[metric] = 1;

        return acc;
      }

      if (metric === 'time-reserved') {
        acc[metric] = acc['duration'];

        return acc;
      }

      const method = this.dealer.askToGiveMethodFor(metric);

      if (method === 'avg' || method === 'sum') {
        acc[metric] = 0;

        return acc;
      }

      acc[metric] = input[metric];

      return acc;
    }, {} as ModelParams);
  }

  /**
   * Checks if `error on padding` is enabled and padding is needed. If so, then throws error.
   */
  private validatePadding(pad: PaddingReceipt): void {
    const { start, end } = pad;
    const isPaddingNeeded = start || end;
    if (!this.allowPadding && isPaddingNeeded) {
      throw new InputValidationError(AVOIDING_PADDING_BY_EDGES(start, end));
    }
  }

  /**
   * Checks if padding is needed either at start of the timeline or the end and returns status.
   */
  private checkForPadding(inputs: ModelParams[]): PaddingReceipt {
    const startDiffInSeconds =
      moment(inputs[0].timestamp).diff(moment(this.startTime)) / 1000;

    const lastInput = inputs[inputs.length - 1];

    const endDiffInSeconds =
      moment(lastInput.timestamp)
        .add(lastInput.duration, 'seconds')
        .diff(moment(this.endTime)) / 1000;

    return {
      start: startDiffInSeconds > 0,
      end: endDiffInSeconds < 0,
    };
  }

  /**
   * Iterates over given inputs frame, meanwhile checking if aggregation method is `sum`, then calculates it.
   * For methods is `avg` and `none` calculating average of the frame.
   */
  private resampleInputFrame = (inputsInTimeslot: ModelParams[]) => {
    return inputsInTimeslot.reduce((acc, input, index, inputs) => {
      const metrics = Object.keys(input);

      metrics.forEach(metric => {
        const method = this.dealer.askToGiveMethodFor(metric);
        acc[metric] = acc[metric] ?? 0;

        if (metric === 'timestamp') {
          acc[metric] = inputs[0][metric];

          return;
        }

        if (method === 'sum') {
          acc[metric] += input[metric];

          return;
        }

        if (method === 'none') {
          acc[metric] = input[metric];

          return;
        }

        /**
         * If timeslot contains records more than one, then divide each metric by the timeslot length,
         *  so that their sum yields the timeslot average.
         */
        if (
          inputsInTimeslot.length > 1 &&
          index === inputsInTimeslot.length - 1
        ) {
          acc[metric] /= inputsInTimeslot.length;

          return;
        }

        acc[metric] += input[metric];
      });

      return acc;
    }, {} as ModelParams);
  };

  /**
   * Takes each array frame with interval length, then aggregating them together as from units.yaml file.
   */
  private resampleInputs(inputs: ModelParams[]) {
    return inputs.reduce((acc: ModelParams[], _input, index, inputs) => {
      const frameStart = index * this.interval;
      const frameEnd = (index + 1) * this.interval;
      const inputsFrame = inputs.slice(frameStart, frameEnd);

      const resampledInput = this.resampleInputFrame(inputsFrame);

      /** Checks if resampled input is not empty, then includes in result. */
      if (Object.keys(resampledInput).length > 0) {
        acc.push(resampledInput);
      }

      return acc;
    }, [] as ModelParams[]);
  }

  /**
   * Pads zeroish inputs from the beginning or at the end of the inputs if needed.
   */
  private padInputs(inputs: ModelParams[], pad: PaddingReceipt): ModelParams[] {
    const { start, end } = pad;
    const paddedFromBeginning = [];

    if (start) {
      const dateRange = momentRange.range(
        moment(this.startTime),
        moment(inputs[0].timestamp).subtract(1, 'second')
      );

      /** Checks if converting to value of is needed. */
      for (const second of dateRange.by('second')) {
        paddedFromBeginning.push(
          this.fillWithZeroishInput(inputs[0], second.valueOf())
        );
      }
    }

    const paddedArray = paddedFromBeginning.concat(inputs);

    if (end) {
      const lastInput = inputs[inputs.length - 1];
      const dateRange = momentRange.range(
        moment(lastInput.timestamp).add(lastInput.duration, 'seconds'),
        moment(this.endTime)
      );

      for (const second of dateRange.by('second')) {
        paddedArray.push(
          this.fillWithZeroishInput(lastInput, second.valueOf())
        );
      }
    }

    return paddedArray;
  }

  /*
   * Checks if input's timestamp is included in global specified period then leaves it, otherwise.
   */
  private trimInputsByGlobalTimeline(inputs: ModelParams[]): ModelParams[] {
    return inputs.reduce((acc: ModelParams[], item) => {
      const { timestamp } = item;

      if (
        moment(timestamp).isSameOrAfter(moment(this.startTime)) &&
        moment(timestamp).isSameOrBefore(moment(this.endTime))
      ) {
        acc.push(item);
      }

      return acc;
    }, [] as ModelParams[]);
  }

  /**
   * Normalizes provided time window according to time configuration.
   */
  async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    this.validateParams();

    const pad = this.checkForPadding(inputs);
    this.validatePadding(pad);
    const paddedInputs = this.padInputs(inputs, pad);

    const flattenInputs = paddedInputs.reduce(
      (acc: ModelParams[], input, index) => {
        const currentMoment = moment(input.timestamp);

        /** Checks if not the first input, then check consistency with previous ones. */
        if (index > 0) {
          const previousInput = paddedInputs[index - 1];
          const previousInputTimestamp = moment(previousInput.timestamp);

          /** Checks for timestamps overlap. */
          if (
            moment(previousInput.timestamp)
              .add(previousInput.duration, 'seconds')
              .isAfter(currentMoment)
          ) {
            throw new InputValidationError(INVALID_OBSERVATION_OVERLAP);
          }

          const compareableTime = previousInputTimestamp.add(
            previousInput.duration,
            'second'
          );

          const timelineGapSize = currentMoment.diff(compareableTime, 'second');

          /** Checks if there is gap in timeline. */
          if (timelineGapSize > 1) {
            for (
              let missingTimestamp = compareableTime.valueOf();
              missingTimestamp <= currentMoment.valueOf() - 1000;
              missingTimestamp += 1000
            ) {
              const filledGap = this.fillWithZeroishInput(
                input,
                missingTimestamp
              );

              acc.push(filledGap);
            }
          }
        }

        /** Break down current observation. */
        for (let i = 0; i < input.duration; i++) {
          const normalizedInput = this.breakDownInput(input, i);

          acc.push(normalizedInput);
        }

        return this.trimInputsByGlobalTimeline(acc);
      },
      [] as ModelParams[]
    );

    const sortedInputs = flattenInputs.sort((a, b) =>
      moment(a.timestamp).diff(moment(b.timestamp))
    );

    return this.resampleInputs(sortedInputs);
  }
}
