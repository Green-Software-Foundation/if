import {ERRORS} from '@grnsft/if-core/utils';

import {MockObservations} from '../../../if-run/builtins/mock-observations';

import {STRINGS} from '../../../if-run/config';

const {InputValidationError, ConfigError} = ERRORS;
const {INVALID_MIN_MAX} = STRINGS;

describe('builtins/mock-observations: ', () => {
  const parametersMetadata = {
    inputs: {},
    outputs: {},
  };
  describe('init: ', () => {
    it('successfully initalized.', () => {
      const config = {
        'timestamp-from': '2023-07-06T00:00',
        'timestamp-to': '2023-07-06T00:01',
        duration: 5,
        components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
        generators: {
          common: {
            region: 'uk-west',
            'common-key': 'common-val',
          },
          randint: {
            'cpu/utilization': {min: 10, max: 95},
            'memory/utilization': {min: 10, max: 85},
          },
        },
      };
      const mockObservations = MockObservations(config, parametersMetadata, {});

      expect(mockObservations).toHaveProperty('metadata');
      expect(mockObservations).toHaveProperty('execute');
    });
  });

  describe('execute(): ', () => {
    it('executes successfully.', async () => {
      const config = {
        'timestamp-from': '2023-07-06T00:00',
        'timestamp-to': '2023-07-06T00:01',
        duration: 30,
        components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
        generators: {
          common: {
            region: 'uk-west',
            'common-key': 'common-val',
          },
          randint: {
            'cpu/utilization': {min: 10, max: 11},
          },
        },
      };
      const mockObservations = MockObservations(config, parametersMetadata, {});
      const result = await mockObservations.execute([]);

      expect.assertions(1);

      expect(result).toStrictEqual([
        {
          timestamp: '2023-07-06T00:00:00.000Z',
          duration: 30,
          'common-key': 'common-val',
          'instance-type': 'A1',
          region: 'uk-west',
          'cpu/utilization': 10,
        },
        {
          timestamp: '2023-07-06T00:00:30.000Z',
          duration: 30,
          'common-key': 'common-val',
          'instance-type': 'A1',
          region: 'uk-west',
          'cpu/utilization': 10,
        },
        {
          timestamp: '2023-07-06T00:00:00.000Z',
          duration: 30,
          'common-key': 'common-val',
          'instance-type': 'B1',
          region: 'uk-west',
          'cpu/utilization': 10,
        },
        {
          timestamp: '2023-07-06T00:00:30.000Z',
          duration: 30,
          'common-key': 'common-val',
          'instance-type': 'B1',
          region: 'uk-west',
          'cpu/utilization': 10,
        },
      ]);
    });

    it('executes successfully when `mapping` is provided.', async () => {
      const config = {
        'timestamp-from': '2023-07-06T00:00',
        'timestamp-to': '2023-07-06T00:01',
        duration: 30,
        components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
        generators: {
          common: {
            region: 'uk-west',
            'common-key': 'common-val',
          },
          randint: {
            'cpu/util': {min: 10, max: 11},
          },
        },
      };
      const mapping = {
        'cpu/utilization': 'cpu/util',
      };
      const mockObservations = MockObservations(
        config,
        parametersMetadata,
        mapping
      );
      const result = await mockObservations.execute([]);

      expect.assertions(1);

      expect(result).toStrictEqual([
        {
          timestamp: '2023-07-06T00:00:00.000Z',
          duration: 30,
          'common-key': 'common-val',
          'instance-type': 'A1',
          region: 'uk-west',
          'cpu/util': 10,
        },
        {
          timestamp: '2023-07-06T00:00:30.000Z',
          duration: 30,
          'common-key': 'common-val',
          'instance-type': 'A1',
          region: 'uk-west',
          'cpu/util': 10,
        },
        {
          timestamp: '2023-07-06T00:00:00.000Z',
          duration: 30,
          'common-key': 'common-val',
          'instance-type': 'B1',
          region: 'uk-west',
          'cpu/util': 10,
        },
        {
          timestamp: '2023-07-06T00:00:30.000Z',
          duration: 30,
          'common-key': 'common-val',
          'instance-type': 'B1',
          region: 'uk-west',
          'cpu/util': 10,
        },
      ]);
    });

    it('throws an error when the `min` is greater then `max` of `randint` config.', async () => {
      const config = {
        'timestamp-from': '2023-07-06T00:00',
        'timestamp-to': '2023-07-06T00:01',
        duration: 30,
        components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
        generators: {
          common: {
            region: 'uk-west',
            'common-key': 'common-val',
          },
          randint: {
            'cpu/utilization': {min: 20, max: 11},
          },
        },
      };

      expect.assertions(2);

      const mockObservations = MockObservations(config, parametersMetadata, {});
      try {
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigError);
        expect(error).toEqual(
          new ConfigError(INVALID_MIN_MAX('cpu/utilization'))
        );
      }
    });

    it('throws when `generators` are not provided.', async () => {
      const config = {
        'timestamp-from': '2023-07-06T00:00',
        'timestamp-to': '2023-07-06T00:01',
        duration: 5,
        components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
      };
      expect.assertions(2);

      try {
        const mockObservations = MockObservations(
          config,
          parametersMetadata,
          {}
        );
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            '"generators" parameter is required. Error code: invalid_type.'
          )
        );
      }
    });

    it('throws when `components` are not provided.', async () => {
      const errorMessage =
        '"components" parameter is required. Error code: invalid_type.';
      const config = {
        'timestamp-from': '2023-07-06T00:00',
        'timestamp-to': '2023-07-06T00:01',
        duration: 5,
        generators: {
          common: {
            region: 'uk-west',
            'common-key': 'common-val',
          },
          randint: {
            'cpu/utilization': {min: 10, max: 95},
            'memory/utilization': {min: 10, max: 85},
          },
        },
      };
      expect.assertions(2);

      try {
        const mockObservations = MockObservations(
          config,
          parametersMetadata,
          {}
        );
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(new InputValidationError(errorMessage));
      }
    });

    it('throws when `duration` is not provided.', async () => {
      expect.assertions(2);

      try {
        const config = {
          'timestamp-from': '2023-07-06T00:00',
          'timestamp-to': '2023-07-06T00:01',
          components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
          generators: {
            common: {
              region: 'uk-west',
              'common-key': 'common-val',
            },
            randint: {
              'cpu/utilization': {min: 10, max: 95},
              'memory/utilization': {min: 10, max: 85},
            },
          },
        };
        const mockObservations = MockObservations(
          config,
          parametersMetadata,
          {}
        );
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            '"duration" parameter is required. Error code: invalid_type.'
          )
        );
      }
    });

    it('throws when `timestamp-to` is not provided.', async () => {
      expect.assertions(2);

      try {
        const config = {
          'timestamp-from': '2023-07-06T00:00',
          duration: 5,
          components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
          generators: {
            common: {
              region: 'uk-west',
              'common-key': 'common-val',
            },
            randint: {
              'cpu/utilization': {min: 10, max: 95},
              'memory/utilization': {min: 10, max: 85},
            },
          },
        };
        const mockObservations = MockObservations(
          config,
          parametersMetadata,
          {}
        );
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            '"timestamp-to" parameter is required. Error code: invalid_type.'
          )
        );
      }
    });

    it('throws when `timestamp-from` is missing.', async () => {
      expect.assertions(2);

      try {
        const config = {
          'timestamp-to': '2023-07-06T00:01',
          duration: 5,
          components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
          generators: {
            common: {
              region: 'uk-west',
              'common-key': 'common-val',
            },
            randint: {
              'cpu/utilization': {min: 10, max: 95},
              'memory/utilization': {min: 10, max: 85},
            },
          },
        };
        const mockObservations = MockObservations(
          config,
          parametersMetadata,
          {}
        );
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            '"timestamp-from" parameter is required. Error code: invalid_type.'
          )
        );
      }
    });

    it('throws an error when `randInt` is not valid.', async () => {
      const config = {
        'timestamp-from': '2023-07-06T00:00',
        'timestamp-to': '2023-07-06T00:01',
        duration: 30,
        components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
        generators: {
          common: {
            region: 'uk-west',
            'common-key': 'common-val',
          },
          randint: null,
        },
      };
      const mockObservations = MockObservations(config, parametersMetadata, {});

      expect.assertions(2);

      try {
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            '"generators.randint" parameter is expected object, received null. Error code: invalid_type.'
          )
        );
      }
    });

    it('throws an error when `common` is not valid.', async () => {
      const config = {
        'timestamp-from': '2023-07-06T00:00',
        'timestamp-to': '2023-07-06T00:01',
        duration: 30,
        components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
        generators: {
          common: null,
          randint: {
            'cpu/utilization': {min: 10, max: 95},
            'memory/utilization': {min: 10, max: 85},
          },
        },
      };
      const mockObservations = MockObservations(config, parametersMetadata, {});

      expect.assertions(2);

      try {
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            '"generators.common" parameter is expected object, received null. Error code: invalid_type.'
          )
        );
      }
    });
  });
});
