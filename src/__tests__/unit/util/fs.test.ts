import {isFileExists} from '../../../util/fs';

jest.mock('fs/promises', () => require('../../../__mocks__/fs'));

describe('util/fs: ', () => {
  describe('isFileExists(): ', () => {
    it('returns true if the file exists.', async () => {
      const result = await isFileExists('true');

      expect.assertions(1);
      expect(result).toEqual(true);
    });

    it('returns fale if the file does not exist.', async () => {
      const result = await isFileExists('false');

      expect.assertions(1);
      expect(result).toEqual(false);
    });
  });
});
