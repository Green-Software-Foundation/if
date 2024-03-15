import {ERRORS} from '../../../util/errors';

describe('util/errors: ', () => {
  describe('ERRORS: ', () => {
    it('checks for properties.', () => {
      const errors = Object.values(ERRORS);

      errors.forEach(error => {
        expect(error).toBeInstanceOf(Function);
      });
    });
  });
});
