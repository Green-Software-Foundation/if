import {PluginParams} from '../../../types/interface';
import {mergeDefaults} from '../../../lib/compute';

describe('lib/compute:', () => {
  describe('compute(): ', () => {
    it('merges inputs array and defaults correctly', () => {
      const input1 = {
        a: 1,
        b: false,
        c: 'testInput1',
        d: 100,
      };
      const input2 = {
        a: 2,
        b: true,
        c: 'testInput2',
      };
      const inputs = [input1, input2];

      const defaults = {
        b: true,
        c: 'testDefault',
        d: 25,
      };

      const expectedResult: PluginParams[] = [
        {
          a: 1,
          b: false,
          c: 'testInput1',
          d: 100,
        },
        {
          a: 2,
          b: true,
          c: 'testInput2',
          d: 25,
        },
      ];
      const result = mergeDefaults(inputs, defaults);
      expect(result).toEqual(expectedResult);
    });
  });
});
