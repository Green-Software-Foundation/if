export type TimeNormalizerConfig = {
  'start-time': string;
  'end-time': string;
  interval: number;
  'allow-padding': boolean;
};

export type PaddingReceipt = {
  start: boolean;
  end: boolean;
};
