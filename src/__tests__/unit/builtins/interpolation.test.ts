import {Interpolation} from '../../../builtins';
import {Method} from '../../../builtins/interpolation/types';
import {ERRORS} from '../../../util/errors';

const {InputValidationError, ConfigNotFoundError} = ERRORS;

describe('builtins/interpolation: ', () => {
  describe('Interpolation: ', () => {
    const globalConfig = {
      method: Method.LINEAR,
      x: [0, 10, 50, 100],
      y: [0.12, 0.32, 0.75, 1.02],
      'input-parameter': 'cpu/utilization',
      'output-parameter': 'interpolation-result',
    };
    const inputs = [
      {
        timestamp: '2023-07-06T00:00',
        duration: 3600,
        'cpu/utilization': 45,
      },
    ];
    const plugin = Interpolation(globalConfig);

    describe('init Interpolation: ', () => {
      it('initalizes object with properties.', async () => {
        expect(plugin).toHaveProperty('metadata');
        expect(plugin).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('returns result when all parameters are valid.', () => {
        const outputs = [
          {
            timestamp: '2023-07-06T00:00',
            duration: 3600,
            'cpu/utilization': 45,
            'interpolation-result': 0.69625,
          },
        ];

        expect(plugin.execute(inputs)).toEqual(outputs);
      });

      it('returns result when the `method` is not provided in the global config.', () => {
        const globalConfig = {
          x: [0, 10, 50, 100],
          y: [0.12, 0.32, 0.75, 1.02],
          'input-parameter': 'cpu/utilization',
          'output-parameter': 'interpolation-result',
        };
        const plugin = Interpolation(globalConfig);

        const outputs = [
          {
            timestamp: '2023-07-06T00:00',
            duration: 3600,
            'cpu/utilization': 45,
            'interpolation-result': 0.69625,
          },
        ];

        expect(plugin.execute(inputs)).toEqual(outputs);
      });

      it('returns result when the `method` is `spline`.', () => {
        const config = Object.assign({}, globalConfig, {method: Method.SPLINE});
        const plugin = Interpolation(config);

        const outputs = [
          {
            timestamp: '2023-07-06T00:00',
            duration: 3600,
            'cpu/utilization': 45,
            'interpolation-result': 0.7169698932926829,
          },
        ];

        expect(plugin.execute(inputs)).toEqual(outputs);
      });

      it('returns result when the `method` is `polynomial`.', () => {
        const config = Object.assign({}, globalConfig, {
          method: Method.POLYNOMIAL,
        });
        const plugin = Interpolation(config);

        const outputs = [
          {
            timestamp: '2023-07-06T00:00',
            duration: 3600,
            'cpu/utilization': 45,
            'interpolation-result': 0.7187374999999999,
          },
        ];

        expect(plugin.execute(inputs)).toEqual(outputs);
      });

      it('returns result when the elements of `x` is not in acsending order.', () => {
        const config = Object.assign({}, globalConfig, {
          x: [0, 10, 100, 50],
        });
        const plugin = Interpolation(config);

        const outputs = [
          {
            timestamp: '2023-07-06T00:00',
            duration: 3600,
            'cpu/utilization': 45,
            'interpolation-result': 0.69625,
          },
        ];

        expect(plugin.execute(inputs)).toEqual(outputs);
      });

      it('returns result when the `cpu/utilization` is equal to one of the `x` points element.', () => {
        const inputs = [
          {
            timestamp: '2023-07-06T00:00',
            duration: 3600,
            'cpu/utilization': 50,
          },
        ];
        const outputs = [
          {
            timestamp: '2023-07-06T00:00',
            duration: 3600,
            'cpu/utilization': 50,
            'interpolation-result': 0.75,
          },
        ];

        expect(plugin.execute(inputs)).toEqual(outputs);
      });

      it('throws an when the global config is not provided.', () => {
        const config = undefined;
        const plugin = Interpolation(config!);

        expect.assertions(2);
        try {
          plugin.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(ConfigNotFoundError);
          expect(error).toEqual(
            new ConfigNotFoundError('Global config is not provided.')
          );
        }
      });

      it('throws an error when `x` and `y` points not equal.', () => {
        const config = Object.assign({}, globalConfig, {
          x: [0, 10, 100],
        });

        const plugin = Interpolation(config);

        expect.assertions(2);
        try {
          plugin.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
          expect(error).toEqual(
            new InputValidationError(
              'The elements count of `x` and `y` should be equal'
            )
          );
        }
      });

      it('throws an error when `cpu/utilization` is out of the range of `x` elements.', () => {
        const inputs = [
          {
            timestamp: '2023-07-06T00:00',
            duration: 3600,
            'cpu/utilization': 105,
          },
        ];
        expect.assertions(2);
        try {
          plugin.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
          expect(error).toEqual(
            new InputValidationError(
              'The `cpu/utilization` value of input[0] should not be out of the range of `x` elements'
            )
          );
        }
      });
    });
  });
});
