/* eslint-disable @typescript-eslint/ban-ts-comment */
jest.mock('fs', () => require('../../../__mocks__/fs'));

import {exhaust} from '../../../lib/exhaust';

import {ERRORS} from '../../../util/errors';

import {STRINGS} from '../../../config';

const {CliInputError, ModuleInitializationError} = ERRORS;
const {INVALID_EXHAUST_PLUGIN} = STRINGS;

describe('lib/exhaust: ', () => {
  describe('exhaust(): ', () => {
    const spy = jest.spyOn(global.console, 'log');

    beforeEach(() => {
      spy.mockReset();
    });

    it('returns void if no exhaust plugin selected, log should be called.', async () => {
      const tree = {};
      const context = {
        initialize: {
          outputs: null,
        },
      };

      // @ts-ignore
      const result = await exhaust(tree, context);

      expect(result).toBeUndefined();
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockReset();
    });

    it('uses log exhaust plugin as export.', async () => {
      const tree = {};
      const context = {
        initialize: {
          outputs: ['log'],
        },
      };

      // @ts-ignore
      await exhaust(tree, context);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('rejects with cli input error if output path is not provided with yaml.', async () => {
      const tree = {};
      const context = {
        initialize: {
          outputs: ['yaml'],
        },
      };
      const expectedMessage = 'Output path is required.';

      expect.assertions(2);

      try {
        // @ts-ignore
        await exhaust(tree, context);
      } catch (error) {
        expect(error).toBeInstanceOf(CliInputError);

        if (error instanceof CliInputError) {
          expect(error.message).toEqual(expectedMessage);
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
      const expectedMessage = INVALID_EXHAUST_PLUGIN(
        context.initialize.outputs[0]
      );

      expect.assertions(2);

      try {
        // @ts-ignore
        await exhaust(tree, context);
      } catch (error) {
        expect(error).toBeInstanceOf(ModuleInitializationError);

        if (error instanceof ModuleInitializationError) {
          expect(error.message).toEqual(expectedMessage);
        }
      }
    });
  });
});
