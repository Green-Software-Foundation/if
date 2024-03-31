/* eslint-disable @typescript-eslint/ban-ts-comment */
jest.mock('mockavizta', () => require('../../../__mocks__/plugin'), {
  virtual: true,
});
jest.mock('../../../builtins', () => require('../../../__mocks__/plugin'), {
  virtual: true,
});
const mockLog = jest.fn();
jest.mock('../../../util/log-memoize', () => ({
  memoizedLog: mockLog,
}));

import {initalize} from '../../../lib/initialize';

import {ERRORS} from '../../../util/errors';

import {STRINGS} from '../../../config';

import {GlobalPlugins} from '../../../types/manifest';

const {PluginCredentialError, ModuleInitializationError} = ERRORS;
const {MISSING_METHOD, MISSING_PATH, INVALID_MODULE_PATH} = STRINGS;

describe('lib/initalize: ', () => {
  describe('initalize(): ', () => {
    it('creates instance with get and set methods.', async () => {
      const plugins = {};
      const response = await initalize(plugins);

      expect(response).toHaveProperty('get');
      expect(response).toHaveProperty('set');
      expect(typeof response.get).toEqual('function');
      expect(typeof response.set).toEqual('function');
    });

    it('checks if plugin is initalized, warning is logged and plugin has execute and metadata props.', async () => {
      const plugins: GlobalPlugins = {
        mockavizta: {
          path: 'mockavizta',
          method: 'Mockavizta',
        },
      };
      const storage = await initalize(plugins);

      const pluginName = Object.keys(plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
      expect(mockLog).toHaveBeenCalledTimes(1); // checks if logger is called
    });

    it('checks if plugin is initalized with global config and has execute and metadata.', async () => {
      const plugins: GlobalPlugins = {
        mockavizta: {
          path: 'mockavizta',
          method: 'Mockavizta',
          'global-config': {
            verbose: true,
          },
        },
      };
      const storage = await initalize(plugins);

      const pluginName = Object.keys(plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
    });

    it('throws error if plugin does not have path property.', async () => {
      const plugins: GlobalPlugins = {
        // @ts-ignore
        mockavizta: {
          method: 'Mockavizta',
          'global-config': {
            verbose: true,
          },
        },
      };

      try {
        await initalize(plugins);
      } catch (error) {
        expect(error).toBeInstanceOf(PluginCredentialError);

        if (error instanceof PluginCredentialError) {
          expect(error.message).toEqual(MISSING_PATH);
        }
      }
    });

    it('throws error if plugin does not have path property.', async () => {
      const plugins: GlobalPlugins = {
        // @ts-ignore
        mockavizta: {
          path: 'mockavizta',
          'global-config': {
            verbose: true,
          },
        },
      };

      try {
        await initalize(plugins);
      } catch (error) {
        expect(error).toBeInstanceOf(PluginCredentialError);

        if (error instanceof PluginCredentialError) {
          expect(error.message).toEqual(MISSING_METHOD);
        }
      }
    });

    it('checks if builtin plugin is initalized.', async () => {
      const plugins: GlobalPlugins = {
        mockavizta: {
          path: 'builtin',
          method: 'Mockavizta',
          'global-config': {
            verbose: true,
          },
        },
      };
      const storage = await initalize(plugins);

      const pluginName = Object.keys(plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
    });

    it('checks if github plugin is initalized.', async () => {
      const plugins: GlobalPlugins = {
        mockavizta: {
          path: 'https://github.com/mockavizta',
          method: 'Mockavizta',
          'global-config': {
            verbose: true,
          },
        },
      };
      const storage = await initalize(plugins);

      const pluginName = Object.keys(plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
    });

    it('throws error if plugin path is invalid.', async () => {
      const plugins: GlobalPlugins = {
        mockavizta: {
          path: 'failing-mock',
          method: 'Mockavizta',
          'global-config': {
            verbose: true,
          },
        },
      };

      try {
        await initalize(plugins);
      } catch (error) {
        expect(error).toBeInstanceOf(ModuleInitializationError);

        if (error instanceof ModuleInitializationError) {
          expect(error.message).toEqual(
            INVALID_MODULE_PATH(plugins.mockavizta.path)
          );
        }
      }
    });
  });
});
