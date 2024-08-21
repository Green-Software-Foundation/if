import {ERRORS} from '@grnsft/if-core/utils';

import {TimeConverter} from '../../../if-run/builtins/time-converter';

import {STRINGS} from '../../../if-run/config';

const {ConfigError, InputValidationError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

describe('builtins/time-converter: ', () => {
  describe('TimeConverter: ', () => {
    const config = {
      'input-parameter': 'energy-per-year',
      'original-time-unit': 'year',
      'new-time-unit': 'duration',
      'output-parameter': 'energy-per-duration',
    };
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const timeConverter = TimeConverter(config, parametersMetadata, {});

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(timeConverter).toHaveProperty('metadata');
        expect(timeConverter).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies TimeConverter strategy to given input.', () => {
        expect.assertions(1);

        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'energy-per-year': 10000,
            'energy-per-duration': 1.140795,
          },
        ];

        const result = timeConverter.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'energy-per-year': 10000,
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when the `mapping` is not empty object.', () => {
        expect.assertions(1);

        const mapping = {
          'energy-per-year': 'energy/year',
        };
        const timeConverter = TimeConverter(
          config,
          parametersMetadata,
          mapping
        );
        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'energy/year': 10000,
            'energy-per-duration': 1.140795,
          },
        ];

        const result = timeConverter.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'energy/year': 10000,
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when the `mapping` maps output parameter.', () => {
        expect.assertions(1);

        const mapping = {
          'energy-per-duration': 'energy/duration',
        };
        const timeConverter = TimeConverter(
          config,
          parametersMetadata,
          mapping
        );
        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'energy-per-year': 10000,
            'energy/duration': 1.140795,
          },
        ];

        const result = timeConverter.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'energy-per-year': 10000,
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error when config is not provided.', () => {
        const config = undefined;
        const timeConverter = TimeConverter(config!, parametersMetadata, {});

        expect.assertions(1);

        try {
          timeConverter.execute([
            {
              timestamp: '2021-01-01T00:00:00Z',
              duration: 3600,
              'energy-per-year': 10000,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(new ConfigError(MISSING_CONFIG));
        }
      });

      it('throws an error on missing params in input.', () => {
        expect.assertions(1);

        try {
          timeConverter.execute([
            {
              timestamp: '2021-01-01T00:00:00Z',
              duration: 3600,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(
              '"energy-per-year" parameter is required. Error code: invalid_type.'
            )
          );
        }
      });

      it('returns a result when `new-time-unit` is a different time unit than `duration`.', () => {
        expect.assertions(1);
        const newConfig = {
          'input-parameter': 'energy-per-year',
          'original-time-unit': 'year',
          'new-time-unit': 'month',
          'output-parameter': 'energy-per-duration',
        };
        const timeConverter = TimeConverter(newConfig, parametersMetadata, {});

        const data = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'energy-per-year': 10000,
          },
        ];
        const response = timeConverter.execute(data);
        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'energy-per-year': 10000,
            'energy-per-duration': 832.886522,
          },
        ];

        expect(response).toEqual(expectedResult);
      });
    });
  });
});
