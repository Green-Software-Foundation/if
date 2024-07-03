/* eslint-disable @typescript-eslint/ban-ts-comment */
jest.mock('fs', () => require('../../../__mocks__/fs'));

import {ERRORS} from '@grnsft/if-core/utils';

import {exhaust} from '../../../lib/exhaust';

import {STRINGS} from '../../../config';

const {ExhaustOutputArgError, InvalidExhaustPluginError} = ERRORS;
const {INVALID_EXHAUST_PLUGIN, OUTPUT_REQUIRED} = STRINGS;

describe('lib/exhaust: ', () => {
  describe('exhaust(): ', () => {
    const spy = jest.spyOn(global.console, 'log');

    beforeEach(() => {
      spy.mockReset();
    });

    it('returns void if no exhaust plugin selected.', async () => {
      const tree = {};
      const context = {
        initialize: {
          outputs: null,
        },
      };

      // @ts-ignore
      const result = await exhaust(tree, context, {});

      expect(result).toBeUndefined();
    });

    it('uses log exhaust plugin as export.', async () => {
      const tree = {};
      const context = {
        initialize: {},
      };

      // @ts-ignore
      await exhaust(tree, context, {'no-outout': false});
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('rejects with cli input error if output path is not provided with yaml.', async () => {
      const tree = {};
      const context = {
        initialize: {
          outputs: ['yaml'],
        },
      };

      expect.assertions(2);

      try {
        // @ts-ignore
        await exhaust(tree, context, {});
      } catch (error) {
        expect(error).toBeInstanceOf(ExhaustOutputArgError);

        if (error instanceof ExhaustOutputArgError) {
          expect(error.message).toEqual(OUTPUT_REQUIRED);
        }
      }
    });

    it('rejects with module init error if output module is not supported.', async () => {
      const tree = {};
      const context = {
        initialize: {
          outputs: ['mock'],
        },
      };

      expect.assertions(2);

      try {
        // @ts-ignore
        await exhaust(tree, context, {});
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidExhaustPluginError);

        if (error instanceof InvalidExhaustPluginError) {
          expect(error.message).toEqual(
            INVALID_EXHAUST_PLUGIN(context.initialize.outputs[0])
          );
        }
      }
    });
  });
});
