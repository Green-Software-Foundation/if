import {compare} from '../../../if-diff/lib/compare';

describe('lib/compare: ', () => {
  describe('compare(): ', () => {
    it('test if empty objects are equal.', () => {
      const a = {};
      const b = {};

      const response = compare(a, b);
      expect(Object.keys(response).length).toEqual(0);
    });

    it('tests for nested objects with arrays.', () => {
      const a = {
        tree: {
          inputs: [1, 2],
        },
      };
      const b = {
        tree: {
          inputs: [1, 2],
        },
      };

      const response = compare(a, b);
      expect(Object.keys(response).length).toEqual(0);
    });

    it('tests for nested objects with arrays (negative case).', () => {
      const a = {
        tree: {
          inputs: [1, 2],
        },
      };
      const b = {
        tree: {
          inputs: [1],
        },
      };

      const response = compare(a, b);
      expect(response.path).toEqual('tree.inputs.1');
      expect(response.source).toEqual(2);
      expect(response.target).toBeUndefined();
    });

    it('checks if execution params are ignored.', () => {
      const a = {
        tree: {
          inputs: [1, 2],
        },
        execution: {
          a: 'mock-a',
          b: 'mock-b',
          status: 'success',
        },
      };
      const b = {
        tree: {
          inputs: [1, 2],
        },
        execution: {
          status: 'success',
        },
      };

      const response = compare(a, b);
      expect(Object.keys(response).length).toEqual(0);
    });

    it('checks if error and status are in place, and others are ignored.', () => {
      const a = {
        tree: {
          inputs: [1, 2],
        },
        execution: {
          a: 'a',
          b: 'b',
          error: 'mock-error-message',
          status: 'fail',
        },
      };
      const b = {
        tree: {
          inputs: [1, 2],
        },
        execution: {
          error: 'mock-error-message',
          status: 'fail',
        },
      };

      const response = compare(a, b);
      expect(Object.keys(response).length).toEqual(0);
    });

    it('checks if arrays are equal.', () => {
      const a = [1, 2];
      const b = [1, 2];

      const response = compare(a, b);
      expect(Object.keys(response).length).toEqual(0);
    });

    it('checks if arrays are equal (first one is missing some items).', () => {
      const a = [1];
      const b = [1, 2];

      const response = compare(a, b);
      const expectedResponse = {path: '1', source: undefined, target: 2};
      expect(response).toEqual(expectedResponse);
    });

    it('executes when path is the `initialize`.', () => {
      const a = {
        tree: {
          inputs: [1, 2],
        },
      };
      const b = {
        tree: {
          inputs: [1, 2],
        },
      };

      const response = compare(a, b, 'initialize');
      expect(Object.keys(response).length).toEqual(0);
    });
  });
});
