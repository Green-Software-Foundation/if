import {ERRORS} from '@grnsft/if-core/utils';

import {STRINGS} from '../../../if-run/config';
import {Regroup} from '../../../if-run/lib/regroup';

const {InvalidGroupingError, InputValidationError} = ERRORS;
const {INVALID_GROUP_KEY} = STRINGS;

describe('lib/regroup: ', () => {
  describe('Regroup: ', () => {
    it('groups inputs correctly.', () => {
      const inputs = [
        {
          timestamp: '2023-07-06T00:00',
          region: 'uk-west',
          'cloud/instance-type': 'A1',
        },
        {
          timestamp: '2023-07-06T05:00',
          region: 'uk-west',
          'cloud/instance-type': 'A1',
        },
        {
          timestamp: '2023-07-06T10:00',
          region: 'uk-west',
          'cloud/instance-type': 'A1',
        },
      ];
      const groups = ['region', 'cloud/instance-type'];

      const expectedOutput = {
        'uk-west': {
          children: {
            A1: {
              inputs: [
                {
                  'cloud/instance-type': 'A1',
                  region: 'uk-west',
                  timestamp: '2023-07-06T00:00',
                },
                {
                  'cloud/instance-type': 'A1',
                  region: 'uk-west',
                  timestamp: '2023-07-06T05:00',
                },
                {
                  'cloud/instance-type': 'A1',
                  region: 'uk-west',
                  timestamp: '2023-07-06T10:00',
                },
              ],
            },
          },
        },
      };

      const result = Regroup(inputs, groups);
      expect(result).toEqual(expectedOutput);
    });

    it('throws an error when groups is not provided.', () => {
      const inputs = [
        {
          timestamp: '2023-07-06T00:00',
          region: 'uk-west',
          'cloud/instance-type': 'A1',
        },
        {
          timestamp: '2023-07-06T05:00',
          region: 'uk-west',
          'cloud/instance-type': 'A1',
        },
        {
          timestamp: '2023-07-06T10:00',
          region: 'uk-west',
          'cloud/instance-type': 'A1',
        },
      ];

      const groups = undefined;

      expect.assertions(2);
      try {
        Regroup(inputs, groups!);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            '"groups" parameter is required. Error code: invalid_type.'
          )
        );
      }
    });

    it('throws an error if `group` is an empty array.', () => {
      const inputs = [
        {
          timestamp: '2023-07-06T00:00',
          'cloud/instance-type': 'A1',
        },
        {
          timestamp: '2023-07-06T05:00',
          region: 'uk-west',
          'cloud/instance-type': 'A1',
        },
        {
          timestamp: '2023-07-06T10:00',
          region: 'uk-west',
          'cloud/instance-type': 'A1',
        },
      ];
      const groups = ['region', 'cloud/instance-type'];

      expect.assertions(2);
      try {
        Regroup(inputs, groups);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidGroupingError);
        expect(error).toEqual(
          new InvalidGroupingError('Invalid group region.')
        );
      }
    });

    it('throws an error if group type is missing from the input.', () => {
      const inputs = [
        {timestamp: 1, region: 'uk-west', 'cloud/instance-type': 'A1'},
      ];
      const groups: any[] = [];

      expect.assertions(2);
      try {
        Regroup(inputs, groups);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            '"groups" parameter is regroup phase is not an array or should contain at least one key.. Error code: too_small.'
          )
        );
      }
    });

    it('throws an error if input does not have required group type.', () => {
      const inputs = [
        {timestamp: 1, region: 'uk-west', 'cloud/instance-type': 'A1'},
      ];
      const groups = ['region', 'cloud/instance-type', 'unknown'];

      expect.assertions(2);
      try {
        Regroup(inputs, groups);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidGroupingError);
        expect(error).toEqual(
          new InvalidGroupingError(INVALID_GROUP_KEY(groups[2]))
        );
      }
    });
  });
});
