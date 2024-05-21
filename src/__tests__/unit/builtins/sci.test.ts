import {Sci} from '../../../builtins/sci';

import {ERRORS} from '../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/sci:', () => {
  describe('Sci: ', () => {
    const sci = Sci();

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(sci).toHaveProperty('metadata');
        expect(sci).toHaveProperty('execute');
      });
    });

    describe('execute():', () => {
      it('returns a result with valid inputs.', async () => {
        const sci = Sci({
          'functional-unit': 'users',
          'functional-unit-time': '1 min',
        });
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.02,
            'carbon-embodied': 5,
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
            sci: 3.012,
          },
        ]);
      });

      it('returns a result with vary input duration.', async () => {
        const sci = Sci({
          'functional-unit': 'requests',
          'functional-unit-time': '1 day',
        });
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.2,
            'carbon-embodied': 0.05,
            duration: 100,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            duration: 2,
          },
        ];
        const result = await sci.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.2,
            'carbon-embodied': 0.05,
            carbon: 0.0025,
            duration: 100,
            sci: 216,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            carbon: 0.00125,
            duration: 2,
            sci: 108,
          },
        ]);
      });

      it('returns a result when `functional-unit-time` is not provided.', async () => {
        const sci = Sci({
          'functional-unit': 'requests',
        });
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.2,
            'carbon-embodied': 0.05,
            duration: 100,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            duration: 2,
          },
        ];
        const result = await sci.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.2,
            'carbon-embodied': 0.05,
            carbon: 0.0025,
            duration: 100,
            sci: 0.0025,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            carbon: 0.00125,
            duration: 2,
            sci: 0.00125,
          },
        ]);
      });

      it('returns a result when `functional-unit` is not provided.', async () => {
        const sci = Sci({
          'functional-unit-time': '1 day',
        });
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.2,
            'carbon-embodied': 0.05,
            duration: 100,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            duration: 2,
          },
        ];
        const result = await sci.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.2,
            'carbon-embodied': 0.05,
            carbon: 0.0025,
            duration: 100,
            sci: 216,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            carbon: 0.00125,
            duration: 2,
            sci: 108,
          },
        ]);
      });

      it('throws exception on invalid functional unit data.', async () => {
        const sci = Sci({
          'functional-unit': 'requests',
          'functional-unit-time': 'bad-data',
        });
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
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws an exception on negative time value.', async () => {
        const sci = Sci({
          'functional-unit': 'requests',
          'functional-unit-time': '-1 hour',
        });
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
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws exception on invalid time unit.', async () => {
        const sci = Sci({
          'functional-unit': 'requests',
          'functional-unit-time': '1 badData',
        });

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
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('returns a result when the value of `functional-unit-time` is separated by underscore.', async () => {
        const sci = Sci({
          'functional-unit': 'requests',
          'functional-unit-time': '2_d',
        });

        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            duration: 1,
          },
        ];
        const result = await sci.execute(inputs);

        expect.assertions(1);
        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            carbon: 0.0025,
            duration: 1,
            sci: 432,
          },
        ]);
      });

      it('returns a result when the value of `functional-unit-time` is separated by hyphen.', async () => {
        const sci = Sci({
          'functional-unit': 'requests',
          'functional-unit-time': '2-d',
        });

        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            duration: 1,
          },
        ];
        const result = await sci.execute(inputs);

        expect.assertions(1);
        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            carbon: 0.0025,
            duration: 1,
            sci: 432,
          },
        ]);
      });

      it('returns a result with the value of `functional-unit-time` from `node-config` and overwritting the value in the `global-config`.', async () => {
        const sci = Sci({
          'functional-unit': 'users',
          'functional-unit-time': '2-d',
        });

        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            duration: 1,
          },
        ];
        const result = await sci.execute(inputs, {
          sci: {'functional-unit': 'requests'},
        });

        expect.assertions(1);
        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            carbon: 0.0025,
            duration: 1,
            sci: 432,
          },
        ]);
      });

      it('throws an exception on bad string formatting (bad separator) in `functional-unit-time`.', async () => {
        const sci = Sci({
          'functional-unit': 'requests',
          'functional-unit-time': '1/d',
        });
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
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws an exception on bad string formatting (no separator) in `functional-unit-time`.', async () => {
        const sci = Sci({
          'functional-unit': 'requests',
          'functional-unit-time': '1hour',
        });
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
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('returns a result either `carbon` or both of `carbon-operational` and `carbon-embodied` are in the input.', async () => {
        const sci = Sci({
          'functional-unit': 'requests',
          'functional-unit-time': '2-d',
        });
        expect.assertions(2);

        const inputsWithCarbon = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            carbon: 0.0025,
            duration: 1,
          },
        ];
        const resultWithCarbon = await sci.execute(inputsWithCarbon);

        expect(resultWithCarbon).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            carbon: 0.0025,
            duration: 1,
            sci: 432,
          },
        ]);

        const inputsWithoutCarbon = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            duration: 1,
          },
        ];
        const resultWithoutCarbon = await sci.execute(inputsWithoutCarbon);

        expect(resultWithoutCarbon).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'carbon-operational': 0.002,
            'carbon-embodied': 0.0005,
            carbon: 0.0025,
            duration: 1,
            sci: 432,
          },
        ]);
      });
    });
  });
});
