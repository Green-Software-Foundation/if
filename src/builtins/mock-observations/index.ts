import {DateTime, Duration} from 'luxon';
import {z} from 'zod';

import {validate} from '../../util/validations';

import {CommonGenerator} from './helpers/common-generator';
import {RandIntGenerator} from './helpers/rand-int-generator';

import {ExecutePlugin, PluginParams} from '../../types/interface';
import {ConfigParams, KeyValuePair} from '../../types/common';
import {Generator} from './interfaces/index';
import {ObservationParams} from './types';

export const MockObservations = (globalConfig: ConfigParams): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Generate sets of mocked observations based on config.
   */
  const execute = (inputs: PluginParams[]) => {
    const {duration, timeBuckets, components, generators} =
      generateParamsFromConfig();
    const generatorToHistory = new Map<Generator, number[]>();

    generators.forEach(generator => {
      generatorToHistory.set(generator, []);
    });

    const defaults = inputs && inputs[0];

    return Object.entries(components).reduce((acc: PluginParams[], item) => {
      const component = item[1];
      timeBuckets.forEach(timeBucket => {
        const observation = createObservation(
          {duration, component, timeBucket, generators},
          generatorToHistory
        );

        acc.push(Object.assign({}, defaults, observation));
      });

      return acc;
    }, []);
  };

  /**
   * Validates global config parameters.
   */
  const validateGlobalConfig = () => {
    const schema = z.object({
      'timestamp-from': z.string(),
      'timestamp-to': z.string(),
      duration: z.number(),
      components: z.array(z.record(z.string())),
      generators: z.object({
        common: z.record(z.string().or(z.number())),
        randint: z.record(z.object({min: z.number(), max: z.number()})),
      }),
    });

    return validate<z.infer<typeof schema>>(schema, globalConfig);
  };

  /**
   * Configures the MockObservations Plugin for IF
   */
  const generateParamsFromConfig = () => {
    const {
      'timestamp-from': timestampFrom,
      'timestamp-to': timestampTo,
      duration,
      generators,
      components,
    } = validateGlobalConfig();
    const convertedTimestampFrom = DateTime.fromISO(timestampFrom, {
      zone: 'UTC',
    });
    const convertedTimestampTo = DateTime.fromISO(timestampTo, {zone: 'UTC'});

    return {
      duration,
      timeBuckets: createTimeBuckets(
        convertedTimestampFrom,
        convertedTimestampTo,
        duration
      ),
      generators: createGenerators(generators),
      components,
    };
  };

  /*
   * create time buckets based on start time, end time and duration of each bucket.
   */
  const createTimeBuckets = (
    timestampFrom: DateTime,
    timestampTo: DateTime,
    duration: number,
    timeBuckets: DateTime[] = []
  ): DateTime[] => {
    if (
      timestampFrom < timestampTo ||
      timestampFrom.plus(Duration.fromObject({seconds: duration})) < timestampTo
    ) {
      return createTimeBuckets(
        timestampFrom.plus(Duration.fromObject({seconds: duration})),
        timestampTo,
        duration,
        [...timeBuckets, timestampFrom]
      );
    }
    return timeBuckets;
  };

  /*
   * create generators based on a given config
   */
  const createGenerators = (generatorsConfig: object): Generator[] => {
    const createCommonGenerator = (config: any): Generator[] => [
      CommonGenerator(config),
    ];

    const createRandIntGenerators = (config: any): Generator[] => {
      return Object.entries(config).map(([fieldToPopulate, value]) =>
        RandIntGenerator(fieldToPopulate, value as KeyValuePair)
      );
    };

    return Object.entries(generatorsConfig).flatMap(([key, value]) =>
      key === 'randint'
        ? createRandIntGenerators(value).flat()
        : createCommonGenerator(value)
    );
  };

  /*
   * Creates time buckets based on start time, end time and duration of each bucket.
   */
  const createObservation = (
    observationParams: ObservationParams,
    generatorToHistory: Map<Generator, number[]>
  ): PluginParams => {
    const {duration, component, timeBucket, generators} = observationParams;
    const timestamp = timeBucket.toISO();

    const generateObservation = (generator: Generator) => {
      const history = generatorToHistory.get(generator) || [];
      const generated: Record<string, any> = generator.next(history);

      generatorToHistory.set(generator, [...history, generated.value]);

      return generated;
    };

    const generateObservations = (gen: Generator) => generateObservation(gen);
    const generatedValues = generators.map(generateObservations);
    const initialObservation: PluginParams = {
      timestamp,
      duration,
      ...component,
    };
    const generatedObservation = generatedValues.reduce(
      (observation, generated) => Object.assign(observation, generated),
      initialObservation
    );

    return generatedObservation as PluginParams;
  };

  return {
    metadata,
    execute,
  };
};
