import {ERRORS} from '@grnsft/if-core/utils';

import {Sci} from '../../../if-run/builtins/sci';

const {MissingInputDataError} = ERRORS;

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
  });
});
