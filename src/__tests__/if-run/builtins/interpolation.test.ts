import {ERRORS} from '@grnsft/if-core/utils';
import {Method} from '@grnsft/if-core/types';

import {Interpolation} from '../../../if-run/builtins';

import {STRINGS} from '../../../if-run/config';

const {InputValidationError, ConfigError} = ERRORS;
const {MISSING_CONFIG, WITHIN_THE_RANGE, ARRAY_LENGTH_NON_EMPTY, X_Y_EQUAL} =
  STRINGS;

describe('builtins/interpolation: ', () => {
  describe('Interpolation: ', () => {
    const config = {
      method: Method.LINEAR,
      x: [0, 10, 50, 100],
      y: [0.12, 0.32, 0.75, 1.02],
      'input-parameter': 'cpu/utilization',
      'output-parameter': 'interpolation-result',
    };
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const inputs = [
      {
        timestamp: '2023-07-06T00:00',
        duration: 3600,
        'cpu/utilization': 45,
      },
    ];

    const plugin = Interpolation(config, parametersMetadata, {});

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

      it('returns result when `mapping` has valid data.', () => {
        const mapping = {
          'cpu/utilization': 'cpu/util',
        };
        const config = {
          method: Method.LINEAR,
          x: [0, 10, 50, 100],
          y: [0.12, 0.32, 0.75, 1.02],
          'input-parameter': 'cpu/utilization',
          'output-parameter': 'result',
        };
        const inputs = [
          {
            timestamp: '2023-07-06T00:00',
            duration: 3600,
            'cpu/util': 45,
          },
        ];
        const plugin = Interpolation(config, parametersMetadata, mapping);
        const outputs = [
          {
            timestamp: '2023-07-06T00:00',
            duration: 3600,
            'cpu/util': 45,
            result: 0.69625,
          },
        ];

        expect(plugin.execute(inputs)).toEqual(outputs);
      });

      it('returns result when the `mapping` maps output parameter.', () => {
        const mapping = {
          'interpolation-result': 'result',
        };
        const config = {
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
        const plugin = Interpolation(config, parametersMetadata, mapping);
        const outputs = [
          {
            timestamp: '2023-07-06T00:00',
            duration: 3600,
            'cpu/utilization': 45,
            result: 0.69625,
          },
        ];

        expect(plugin.execute(inputs)).toEqual(outputs);
      });

      it('returns result when the `method` is not provided in the config.', () => {
        const config = {
          x: [0, 10, 50, 100],
          y: [0.12, 0.32, 0.75, 1.02],
          'input-parameter': 'cpu/utilization',
          'output-parameter': 'interpolation-result',
        };

        const plugin = Interpolation(config, parametersMetadata, {});
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
        const newConfig = Object.assign({}, config, {method: Method.SPLINE});
        const plugin = Interpolation(newConfig, parametersMetadata, {});

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
        const newConfig = Object.assign({}, config, {
          method: Method.POLYNOMIAL,
        });
        const plugin = Interpolation(newConfig, parametersMetadata, {});

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
        const newConfig = Object.assign({}, config, {
          x: [0, 10, 100, 50],
        });
        const plugin = Interpolation(newConfig, parametersMetadata, {});
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

      it('throws an when the config is not provided.', () => {
        const config = undefined;
        const plugin = Interpolation(config!, parametersMetadata, {});

        expect.assertions(2);
        try {
          plugin.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(ConfigError);
          expect(error).toEqual(new ConfigError(MISSING_CONFIG));
        }
      });

      it('throws an error when `x` and `y` points not equal.', () => {
        const newConfig = Object.assign({}, config, {
          x: [0, 10, 100],
        });
        const plugin = Interpolation(newConfig, parametersMetadata, {});

        expect.assertions(2);
        try {
          plugin.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
          expect(error).toEqual(new InputValidationError(X_Y_EQUAL));
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
          expect(error).toEqual(new InputValidationError(WITHIN_THE_RANGE));
        }
      });
      it('throws an error when the the length of the input arrays is <2', () => {
        const basicConfig = {
          x: [0],
          y: [0.12],
          'input-parameter': 'cpu/utilization',
          'output-parameter': 'interpolation-result',
        };

        const config = Object.assign({}, basicConfig, {method: Method.SPLINE});
        const plugin = Interpolation(config, parametersMetadata, {});
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
            new InputValidationError(ARRAY_LENGTH_NON_EMPTY)
          );
        }
      });
    });
  });
});
