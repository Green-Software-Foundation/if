import {DateTime} from 'luxon';

export type TimeNormalizerConfig = {
  'start-time': Date | string;
  'end-time': Date | string;
  interval: number;
  'allow-padding': boolean;
  'upsampling-resolution'?: number;
};

export type PaddingReceipt = {
  start: boolean;
  end: boolean;
};

export type TimeParams = {
  startTime: DateTime;
  endTime: DateTime;
  interval: number;
  allowPadding: boolean;
  upsamplingResolution: number;
};
