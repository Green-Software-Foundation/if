jest.mock('fs/promises', () => require('../../../__mocks__/fs'));

import {readAndParseJson} from '../../../util/json';

describe('util/json: ', () => {
  describe('readAndParseJson(): ', () => {
    it('returns file content from path.', async () => {
      const path = 'mock/path/json';
      expect.assertions(1);

      const response = await readAndParseJson<typeof path>(path);
      expect(response).toEqual(path);
    });

    it('throws error if path does not exist.', async () => {
      const path = 'mock/path/json-reject';
      expect.assertions(1);

      try {
        await readAndParseJson<typeof path>(path);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
