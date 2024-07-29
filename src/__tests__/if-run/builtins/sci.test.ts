import {ERRORS} from '@grnsft/if-core/utils';

import {Sci} from '../../../if-run/builtins/sci';

const {MissingInputDataError} = ERRORS;

describe('builtins/sci:', () => {
  describe('Sci: ', () => {
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const sci = Sci({'functional-unit': 'users'}, parametersMetadata);

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(sci).toHaveProperty('metadata');
        expect(sci).toHaveProperty('execute');
      });
    });

    describe('execute():', () => {
      it('returns a result with valid inputs.', async () => {
        const sci = Sci(
          {
            'functional-unit': 'users',
          },
          parametersMetadata
        );
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

      it('returns the same result regardless of input duration.', async () => {
        const sci = Sci(
          {
            'functional-unit': 'requests',
          },
          parametersMetadata
        );
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
        const sci = Sci(
          {
            'functional-unit': 'requests',
          },
          parametersMetadata
        );
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
        const sci = Sci(
          {
            'functional-unit': 'requests',
          },
          parametersMetadata
        );
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
      const sci = Sci(
        {
          'functional-unit': 'requests',
        },
        parametersMetadata
      );
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
  });
});
