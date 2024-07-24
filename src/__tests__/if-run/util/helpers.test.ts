const mockWarn = jest.fn();
const mockError = jest.fn();

import {ERRORS} from '@grnsft/if-core/utils';

import {GlobalPlugins} from '../../../common/types/manifest';

import {storeAggregationMetrics} from '../../../if-run/lib/aggregate';

import {
  andHandle,
  mergeObjects,
  storeAggregationMethods,
} from '../../../if-run/util/helpers';

const {WriteFileError} = ERRORS;

jest.mock('../../../common/util/logger', () => ({
  logger: {
    warn: mockWarn,
    error: mockError,
  },
}));

jest.mock('../../../if-run/lib/aggregate', () => ({
  storeAggregationMetrics: jest.fn(),
}));

describe('if-run/util/helpers: ', () => {
  describe('andHandle(): ', () => {
    afterEach(() => {
      mockWarn.mockReset();
      mockError.mockReset();
    });

    it('logs error in case of error is unknown.', () => {
      const message = 'mock-message';

      andHandle(new WriteFileError(message));
      expect(mockWarn).toHaveBeenCalledTimes(0);
      expect(mockError).toHaveBeenCalledTimes(1);
    });
  });

  describe('mergeObjects(): ', () => {
    it('does not override input.', () => {
      expect.assertions(1);

      const input = {
        a: 1,
        b: false,
        c: 'testInput',
      };

      const defaults = {
        c: 'testDefault',
      };
      const result = mergeObjects(defaults, input);

      expect(result).toEqual(input);
    });

    it('overrides null/undefined inputs.', () => {
      expect.assertions(1);

      const input = {
        a: 1,
        b: false,
        c: 'testInput',
        d: null,
        e: undefined,
      };

      const defaults = {
        c: 'testDefault',
        d: 'testDefault',
        e: 'testDefault',
      };
      const result = mergeObjects(defaults, input);
      const expectedResult = {
        a: 1,
        b: false,
        c: 'testInput',
        d: 'testDefault',
        e: 'testDefault',
      };

      expect(result).toEqual(expectedResult);
    });

    it('adds only properties missing in input.', () => {
      expect.assertions(1);

      const input = {
        a: 1,
        b: false,
        c: 'testInput',
      };

      const defaults = {
        b: true,
        c: 'testDefault',
        d: 25,
      };

      const result = mergeObjects(defaults, input);
      const expectedResult = {
        a: 1,
        b: false,
        c: 'testInput',
        d: 25,
      };

      expect(result).toEqual(expectedResult);
    });

    it('keeps values from input in case of nested objects.', () => {
      expect.assertions(1);

      const input = {
        a: 1,
        b: false,
        c: 'testInput',
        d: {
          e: 1,
        },
      };

      const defaults = {
        b: true,
        c: 'testDefault1',
        d: {
          e: 25,
          f: 'testDefault2',
        },
      };

      const result = mergeObjects(defaults, input);
      const expectedResult = {
        a: 1,
        b: false,
        c: 'testInput',
        d: {
          e: 1,
        },
      };

      expect(result).toEqual(expectedResult);
    });

    it('keeps value from input in case of arrays.', () => {
      expect.assertions(1);

      const input = {
        a: 1,
        b: false,
        c: 'testInput1',
        d: [1, 2, 3, 4],
        e: 'testInput2',
      };

      const defaults = {
        b: true,
        c: 'testDefault1',
        d: [5, 6, 7, 8, 9],
        e: [1, 2, 3],
      };

      const result = mergeObjects(defaults, input);
      const expectedResult = {
        a: 1,
        b: false,
        c: 'testInput1',
        d: [1, 2, 3, 4],
        e: 'testInput2',
      };

      expect(result).toEqual(expectedResult);
    });
  });

  describe('storeAggregationMethods(): ', () => {
    const mockPluginStorage = {
      get: jest.fn(),
      set: jest.fn((_name, _plugin) => {}),
    };

    const mockPlugins: GlobalPlugins = {
      multiply: {
        path: 'builtin',
        method: 'Multiply',
      },
      sci: {
        path: 'builtin',
        method: 'Sci',
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('succefully executes with correct metrics.', () => {
      const mockPlugin1 = {
        execute: () => [{}],
        metadata: {
          kind: 'execute',
          inputs: {
            carbon: {
              description: 'mock description',
              unit: 'none',
              'aggregation-method': 'sum',
            },
          },
          outputs: {
            cpu: {
              description: 'mock description',
              unit: 'none',
              'aggregation-method': 'avg',
            },
          },
        },
      };

      const mockPlugin2 = {
        metadata: {
          inputs: {},
          outputs: {
            carbon: {'aggregation-method': 'none'},
          },
        },
      };

      mockPluginStorage.get
        .mockReturnValueOnce(mockPlugin1)
        .mockReturnValueOnce(mockPlugin2);

      // @ts-ignore
      storeAggregationMethods(mockPlugins, mockPluginStorage);

      expect(storeAggregationMetrics).toHaveBeenCalledTimes(3);
      expect(storeAggregationMetrics).toHaveBeenNthCalledWith(1, {
        metrics: {
          carbon: {method: 'sum'},
        },
      });
      expect(storeAggregationMetrics).toHaveBeenNthCalledWith(2, {
        metrics: {
          cpu: {method: 'avg'},
        },
      });
      expect(storeAggregationMetrics).toHaveBeenNthCalledWith(3, {
        metrics: {
          carbon: {method: 'none'},
        },
      });
    });

    it('does not execute if there are no inputs or outputs.', () => {
      mockPluginStorage.get.mockReturnValueOnce({
        execute: () => [{}],
        metadata: {},
      });

      const mockPlugin = {
        execute: () => [{}],
        metadata: {
          kind: 'execute',
        },
      };

      mockPluginStorage.get.mockReturnValueOnce(mockPlugin);
      // @ts-ignore
      storeAggregationMethods(mockPlugins, mockPluginStorage);
      expect(storeAggregationMetrics).not.toHaveBeenCalled();
    });
  });
});
