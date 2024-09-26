import {ERRORS} from '@grnsft/if-core/utils';

import {Sci} from '../../../if-run/builtins/sci';

import {STRINGS} from '../../../if-run/config';

const {MissingInputDataError, ConfigError, InputValidationError} = ERRORS;

const {MISSING_CONFIG} = STRINGS;

describe('builtins/sci:', () => {
  describe('Sci: ', () => {
    const config = {'functional-unit': 'users'};
    const parametersMetadata = {inputs: {}, outputs: {}};
    const sci = Sci(config, parametersMetadata, {});

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(sci).toHaveProperty('metadata');
        expect(sci).toHaveProperty('execute');
      });
    });

    describe('execute():', () => {
      it('returns a result with valid inputs.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.02,
            'carbon-embodied': 5,
            carbon: 5.02,
            users: 100,
            duration: 1,
          },
        ];
        const result = await sci.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.02,
            'carbon-embodied': 5,
            carbon: 5.02,
            users: 100,
            duration: 1,
            sci: 0.050199999999999995,
          },
        ]);
      });

      it('successfully executes when `mapping` has valid data.', async () => {
        const mapping = {
          'carbon-footprint': 'carbon-embodied',
        };
        const sci = Sci(config, parametersMetadata, mapping);
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 1,
            'carbon-operational': 0.02,
            'carbon-embodied': 5,
            carbon: 5.02,
            users: 100,
          },
        ];
        const result = await sci.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.02,
            'carbon-embodied': 5,
            carbon: 5.02,
            users: 100,
            duration: 1,
            sci: 0.050199999999999995,
          },
        ]);
      });

      it('successfully executes when the `mapping` maps output parameter.', async () => {
        const mapping = {
          sci: 'sci-result',
        };
        const sci = Sci(config, parametersMetadata, mapping);
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 1,
            'carbon-operational': 0.02,
            'carbon-footprint': 5,
            carbon: 5.02,
            users: 100,
          },
        ];
        const result = await sci.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.02,
            'carbon-footprint': 5,
            carbon: 5.02,
            users: 100,
            duration: 1,
            'sci-result': 0.050199999999999995,
          },
        ]);
      });

      it('returns the same result regardless of input duration.', async () => {
        const config = {'functional-unit': 'requests'};
        const sci = Sci(config, parametersMetadata, {});
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.2,
            'carbon-embodied': 0.05,
            carbon: 0.205,
            duration: 1,
            requests: 10,
          },
          {
            timestamp: '2021-01-01T00:01:00Z',
            'carbon-operational': 0.2,
            'carbon-embodied': 0.05,
            carbon: 0.205,
            duration: 100,
            requests: 10,
          },
        ];
        const result = await sci.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.2,
            'carbon-embodied': 0.05,
            carbon: 0.205,
            duration: 1,
            requests: 10,
            sci: 0.020499999999999997,
          },
          {
            timestamp: '2021-01-01T00:01:00Z',
            carbon: 0.205,
            'carbon-embodied': 0.05,
            'carbon-operational': 0.2,
            duration: 100,
            requests: 10,
            sci: 0.020499999999999997,
          },
        ]);
      });

      it('throws exception on invalid functional unit data.', async () => {
        const config = {'functional-unit': 'requests'};
        const sci = Sci(config, parametersMetadata, {});
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            duration: 1,
          },
        ];

        expect.assertions(1);

        try {
          await sci.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(MissingInputDataError);
        }
      });

      it('throws exception if functional unit value is not positive integer.', async () => {
        const config = {'functional-unit': 'requests'};
        const sci = Sci(config, parametersMetadata, {});
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            duration: 1,
            requests: -5,
          },
        ];

        expect.assertions(1);

        try {
          await sci.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(MissingInputDataError);
        }
      });
    });

    it('fallbacks to carbon value, if functional unit is 0.', async () => {
      const config = {'functional-unit': 'requests'};
      const sci = Sci(config, parametersMetadata, {});
      const inputs = [
        {
          timestamp: '2021-01-01T00:00:00Z',
          'carbon-operational': 0.2,
          'carbon-embodied': 0.05,
          carbon: 0.205,
          duration: 1,
          requests: 0,
        },
      ];
      const result = await sci.execute(inputs);

      expect.assertions(1);

      expect(result).toStrictEqual([{...inputs[0], sci: inputs[0].carbon}]);
    });

    it('throws an error on missing config.', async () => {
      const config = undefined;
      const sci = Sci(config!, parametersMetadata, {});

      expect.assertions(1);

      try {
        await sci.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
          },
        ]);
      } catch (error) {
        expect(error).toStrictEqual(new ConfigError(MISSING_CONFIG));
      }
    });

    it('successfully executes when a parameter contains arithmetic expression.', async () => {
      const config = {'functional-unit': '=10*users'};
      const sci = Sci(config, parametersMetadata, {});
      expect.assertions(1);

      const inputs = [
        {
          timestamp: '2021-01-01T00:00:00Z',
          'carbon-operational': 0.02,
          'carbon-embodied': 5,
          carbon: 5.02,
          users: 100,
          duration: 1,
        },
      ];
      const result = await sci.execute(inputs);

      expect.assertions(1);
      expect(result).toStrictEqual([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'carbon-operational': 0.02,
          'carbon-embodied': 5,
          carbon: 5.02,
          users: 100,
          duration: 1,
          // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
          sci: 0.0050199999999999995,
        },
      ]);
    });

    it('throws an error the `functional-unit` parameter has wrong arithmetic expression.', async () => {
      const config = {'functional-unit': '10*users'};
      const sci = Sci(config, parametersMetadata, {});
      expect.assertions(1);

      const inputs = [
        {
          timestamp: '2021-01-01T00:00:00Z',
          'carbon-operational': 0.02,
          'carbon-embodied': 5,
          carbon: 5.02,
          users: 100,
          duration: 1,
        },
      ];

      expect.assertions(2);

      try {
        await sci.execute(inputs);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toEqual(
          new InputValidationError(
            'The `functional-unit` contains an invalid arithmetic expression. It should start with `=` and include the symbols `*`, `+`, `-` and `/`.'
          )
        );
      }
    });
  });
});
