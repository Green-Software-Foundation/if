jest.mock('node:readline/promises', () =>
  require('../../../__mocks__/readline')
);

import {
  parseManifestFromStdin,
  mapInputIfNeeded,
  mapConfigIfNeeded,
  mapOutputIfNeeded,
} from '../../../common/util/helpers';

describe('common/util/helpers: ', () => {
  describe('parseManifestFromStdin(): ', () => {
    it('returns empty string if there is no data in stdin.', async () => {
      const response = await parseManifestFromStdin();
      const expectedResult = '';

      expect(response).toEqual(expectedResult);
    });

    it('returns empty string if nothing is piped.', async () => {
      const originalIsTTY = process.stdin.isTTY;
      process.stdin.isTTY = true;
      const response = await parseManifestFromStdin();
      const expectedResult = '';

      expect(response).toEqual(expectedResult);
      process.stdin.isTTY = originalIsTTY;
    });

    it('throws error if there is no manifest in stdin.', async () => {
      process.env.readline = 'no_manifest';
      expect.assertions(1);

      const response = await parseManifestFromStdin();

      expect(response).toEqual('');
    });

    it('returns empty string if there is no data in stdin.', async () => {
      process.env.readline = 'manifest';
      const response = await parseManifestFromStdin();
      const expectedMessage =
        '\nname: mock-name\ndescription: mock-description\n';
      expect.assertions(1);
      expect(response).toEqual(expectedMessage);
    });
  });

  describe('mapInputIfNeeded(): ', () => {
    it('returns a new object with no changes when mapping is empty.', () => {
      const input = {
        timestamp: '2021-01-01T00:00:00Z',
        duration: 60 * 60 * 24 * 30,
        'device/carbon-footprint': 200,
        'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
        'resources-reserved': 1,
        'resources-total': 1,
      };
      const mapping = {};

      const result = mapInputIfNeeded(input, mapping);

      expect(result).toEqual(input);
    });

    it('returns a new object with keys remapped according to the mapping.', () => {
      const input = {
        timestamp: '2021-01-01T00:00:00Z',
        duration: 60 * 60 * 24 * 30,
        'device/carbon-footprint': 200,
        'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
        'resources-reserved': 1,
        'resources-total': 1,
      };
      const mapping = {'device/emissions-embodied': 'device/carbon-footprint'};

      const expectedOutput = {
        timestamp: '2021-01-01T00:00:00Z',
        duration: 60 * 60 * 24 * 30,
        'device/emissions-embodied': 200,
        'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
        'resources-reserved': 1,
        'resources-total': 1,
      };

      const result = mapInputIfNeeded(input, mapping);

      expect(result).toEqual(expectedOutput);
      expect(result).not.toHaveProperty('device/carbon-footprint');
    });
  });

  describe('mapConfigIfNeeded', () => {
    it('returns the config as is if no mapping is provided.', () => {
      const config = {
        filepath: './file.csv',
        query: {
          'cpu-cores-available': 'cpu/available',
          'cpu-cores-utilized': 'cpu/utilized',
          'cpu-manufacturer': 'cpu/manufacturer',
        },
        output: ['cpu-tdp', 'tdp'],
      };

      const nullMapping = null;
      expect(mapConfigIfNeeded(config, nullMapping!)).toEqual(config);

      const undefinedMapping = undefined;
      expect(mapConfigIfNeeded(config, undefinedMapping!)).toEqual(config);
    });

    it('recursively maps config keys and values according to the mapping.', () => {
      const config = {
        filepath: './file.csv',
        query: {
          'cpu-cores-available': 'cpu/available',
          'cpu-cores-utilized': 'cpu/utilized',
          'cpu-manufacturer': 'cpu/manufacturer',
        },
        output: ['cpu-tdp', 'tdp'],
      };
      const mapping = {
        'cpu/utilized': 'cpu/util',
      };

      const expected = {
        filepath: './file.csv',
        query: {
          'cpu-cores-available': 'cpu/available',
          'cpu-cores-utilized': 'cpu/util',
          'cpu-manufacturer': 'cpu/manufacturer',
        },
        output: ['cpu-tdp', 'tdp'],
      };
      expect(mapConfigIfNeeded(config, mapping)).toEqual(expected);
    });

    it('returns an empty object or array when config is an empty object or array.', () => {
      expect(mapConfigIfNeeded({}, {})).toEqual({});
      expect(mapConfigIfNeeded([], {})).toEqual([]);
    });
  });

  describe('mapOutputIfNeeded(): ', () => {
    const output = {
      timestamp: '2021-01-01T00:00:00Z',
      duration: 3600,
      'cpu/energy': 1,
      'network/energy': 1,
      'memory/energy': 1,
    };
    it('returns provided `output` if `mapping` is not valid.', () => {
      const mapping = undefined;
      const mappedOutput = mapOutputIfNeeded(output, mapping!);

      expect.assertions(1);
      expect(mappedOutput).toEqual(output);
    });

    it('returns mapped output if `mapping` has data.', () => {
      const mapping = {
        'cpu/energy': 'energy-from-cpu',
        'network/energy': 'energy-from-network',
      };
      const expectedOutput = {
        timestamp: '2021-01-01T00:00:00Z',
        duration: 3600,
        'energy-from-cpu': 1,
        'energy-from-network': 1,
        'memory/energy': 1,
      };
      const mappedOutput = mapOutputIfNeeded(output, mapping);

      expect.assertions(1);
      expect(mappedOutput).toEqual(expectedOutput);
    });

    it('returns the correct mapped output if some properties are mismatched.', () => {
      const mapping = {
        'mock-cpu/energy': 'energy-from-cpu',
        'network/energy': 'energy-from-network',
      };
      const expectedOutput = {
        timestamp: '2021-01-01T00:00:00Z',
        duration: 3600,
        'cpu/energy': 1,
        'energy-from-network': 1,
        'memory/energy': 1,
      };
      const mappedOutput = mapOutputIfNeeded(output, mapping);

      expect.assertions(1);
      expect(mappedOutput).toEqual(expectedOutput);
    });
  });
});
