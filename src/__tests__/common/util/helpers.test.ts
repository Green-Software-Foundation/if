jest.mock('node:readline/promises', () =>
  require('../../../__mocks__/readline')
);

import {parseManifestFromStdin, mapOutput} from '../../../common/util/helpers';

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

  describe('mapOutput(): ', () => {
    const output = {
      timestamp: '2021-01-01T00:00:00Z',
      duration: 3600,
      'cpu/energy': 1,
      'network/energy': 1,
      'memory/energy': 1,
    };
    it('returns provided `output` if `mapping` is not valid.', () => {
      const mapping = undefined;
      const mappedOutput = mapOutput(output, mapping!);

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
      const mappedOutput = mapOutput(output, mapping);

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
      const mappedOutput = mapOutput(output, mapping);

      expect.assertions(1);
      expect(mappedOutput).toEqual(expectedOutput);
    });
  });
});
