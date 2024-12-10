import {z} from 'zod';

import {ERRORS} from '@grnsft/if-core/utils';

import {
  atLeastOneDefined,
  allDefined,
  validate,
  validateManifest,
  manifestSchema,
} from '../../../common/util/validations';

const {InputValidationError, ManifestValidationError} = ERRORS;

describe('utils/validations: ', () => {
  describe('atLeastOneDefined(): ', () => {
    it('returns true if at least one value is defined.', () => {
      const input = {
        'cpu/utilization': undefined,
        users: 42,
        carbon: undefined,
      };
      expect(atLeastOneDefined(input)).toBe(true);
    });

    it('returns false if all values are undefined.', () => {
      const input = {
        'cpu/utilization': undefined,
        users: undefined,
        carbon: undefined,
      };

      expect(atLeastOneDefined(input)).toBe(false);
    });

    it('returns true if all values are defined.', () => {
      const input = {'cpu/utilization': 0.1, users: 100, carbon: 200};

      expect(atLeastOneDefined(input)).toBe(true);
    });

    it('returns true if at least one value is `null` (null is defined).', () => {
      const input = {
        'cpu/utilization': undefined,
        users: null,
        carbon: undefined,
      };

      expect(atLeastOneDefined(input)).toBe(true);
    });

    it('returns false for an empty object.', () => {
      const input = {};

      expect(atLeastOneDefined(input)).toBe(false);
    });
  });

  describe('allDefined(): ', () => {
    it('returns true when all values are defined.', () => {
      const input = {
        'cloud/instance-type': 'A1',
        region: 'uk-west',
        duration: 1,
        'cpu/utilization': 10,
        'network/energy': 10,
        energy: 5,
      };

      expect(allDefined(input)).toBe(true);
    });

    it('returns false when any value is undefined.', () => {
      const input = {
        'cloud/instance-type': 'A1',
        region: undefined,
        duration: 1,
        'cpu/utilization': 10,
        'network/energy': 10,
        energy: 5,
      };

      expect(allDefined(input)).toBe(false);
    });

    it('returns true for an empty object.', () => {
      expect(allDefined({})).toBe(true);
    });
  });

  describe('validate(): ', () => {
    const schema = z.object({
      coefficient: z.number(),
      'input-parameter': z.string().min(1),
      'output-parameter': z.string().min(1),
    });

    it('successfully returns valid data.', () => {
      const validObject = {
        coefficient: 3,
        'input-parameter': 'cpu/memory',
        'output-parameter': 'result',
      };
      const result = validate(schema, validObject);

      expect(result).toEqual(validObject);
    });

    it('throws an InputValidationError with a formatted message when validation fails.', () => {
      const invalidObject = {
        coefficient: 3,
        'input-parameter': 2,
        'output-parameter': 'result',
      };

      expect.assertions(2);
      try {
        validate(schema, invalidObject);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            '"input-parameter" parameter is expected string, received number. Error code: invalid_type.'
          )
        );
      }
    });

    it('uses a custom error constructor when provided', () => {
      const invalidObject = {
        coefficient: 3,
        'input-parameter': 2,
        'output-parameter': 'result',
      };

      expect.assertions(1);
      try {
        validate(schema, invalidObject, undefined, ManifestValidationError);
      } catch (error) {
        expect(error).toBeInstanceOf(ManifestValidationError);
      }
    });

    it('throws an InputValidationError for invalid_union issue and call prettifyErrorMessage.', () => {
      const schema = z.object({
        data: z.union([z.string(), z.number().min(10)]),
      });
      const invalidObject = {data: false};
      const index = 3;

      expect.assertions(2);

      try {
        validate(schema, invalidObject, index);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            '"data" parameter is expected string, received boolean at index 3. Error code: invalid_union.'
          )
        );
      }
    });

    it('returns only the error message when path is empty.', () => {
      const schema = z.object({
        '': z.string().min(1),
      });

      const invalidObject = {};
      const index = 4;

      expect.assertions(2);
      try {
        validate(schema, invalidObject, index);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(new InputValidationError('Required'));
      }
    });
  });

  describe('validateManifest(): ', () => {
    beforeEach(() => {
      jest.spyOn(console, 'debug').mockImplementation(() => {});
      jest.clearAllMocks();
    });

    it('logs the validation process and call validate with correct arguments.', () => {
      const mockManifest = {
        name: 'mock-name',
        initialize: {
          plugins: {
            'memory-energy-from-memory-util': {
              path: 'builtin',
              method: 'Coefficient',
            },
          },
        },
        tree: {
          children: {
            child: {
              pipeline: {compute: 'memory-energy-from-memory-util'},
              inputs: [
                {
                  timestamp: '2023-12-12T00:00:00.000Z',
                  duration: 3600,
                  'memory/utilization': 10,
                },
              ],
            },
          },
        },
      };
      const mockResult = {isValid: true};
      const validateSpy = jest
        .spyOn(require('../../../common/util/validations'), 'validate')
        .mockReturnValue(mockResult);
      const result = validateManifest(mockManifest);

      expect(console.debug).toHaveBeenCalledWith('Validating manifest');
      expect(validateSpy).toHaveBeenCalledWith(
        manifestSchema,
        mockManifest,
        undefined,
        ManifestValidationError
      );
      expect(result).toBe(mockResult);
    });

    it('throws an error if validation fails.', () => {
      const mockManifest = {invalidKey: 'value'};
      const mockError = new ManifestValidationError('Validation failed');
      const validateSpy = jest
        .spyOn(require('../../../common/util/validations'), 'validate')
        .mockImplementation(() => {
          throw mockError;
        });

      expect(() => validateManifest(mockManifest)).toThrow(
        ManifestValidationError
      );
      expect(validateSpy).toHaveBeenCalledWith(
        manifestSchema,
        mockManifest,
        undefined,
        ManifestValidationError
      );
    });
  });
});
