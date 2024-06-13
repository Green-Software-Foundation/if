import {ERRORS} from '@grnsft/if-core';

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
