/* eslint-disable @typescript-eslint/ban-ts-comment */
jest.mock('mockavizta', () => require('../../../__mocks__/plugin'), {
  virtual: true,
});

jest.mock('sci-embodied', () => require('../../../__mocks__/plugin'), {
  virtual: true,
});

jest.mock(
  '../../../if-run/builtins',
  () => require('../../../__mocks__/plugin'),
  {
    virtual: true,
  }
);
const mockLog = jest.fn();
jest.mock('../../../if-run/util/log-memoize', () => ({
  memoizedLog: mockLog,
}));

import {ERRORS} from '@grnsft/if-core/utils';

import {initialize} from '../../../if-run/lib/initialize';
import {STRINGS} from '../../../if-run/config';

const {
  MissingPluginPathError,
  MissingPluginMethodError,
  PluginInitializationError,
} = ERRORS;
const {MISSING_METHOD, MISSING_PATH, INVALID_MODULE_PATH} = STRINGS;

describe('lib/initialize: ', () => {
  describe('initialize(): ', () => {
    it('creates instance with get and set methods.', async () => {
      const context = {initialize: {plugins: {}}};
      // @ts-ignore
      const response = await initialize(context);

      expect(response).toHaveProperty('get');
      expect(response).toHaveProperty('set');
      expect(typeof response.get).toEqual('function');
      expect(typeof response.set).toEqual('function');
    });

    it('checks if plugin is initalized, warning is logged and plugin has execute and metadata props.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              path: 'mockavizta',
              method: 'Mockavizta',
            },
          },
        },
      };
      // @ts-ignore
      const storage = await initialize(context);

      const pluginName = Object.keys(context.initialize.plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
      expect(mockLog).toHaveBeenCalledTimes(1); // checks if logger is called
    });

    it('checks if plugin is initalized with config and has execute and metadata.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              path: 'mockavizta',
              method: 'Mockavizta',
              config: {
                verbose: true,
              },
            },
          },
        },
      };
      // @ts-ignore
      const storage = await initialize(context);

      const pluginName = Object.keys(context.initialize.plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
    });

    it('throws error if plugin does not have path property.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              method: 'Mockavizta',
              config: {
                verbose: true,
              },
            },
          },
        },
      };

      try {
        // @ts-ignore
        await initialize(context);
      } catch (error) {
        expect(error).toBeInstanceOf(MissingPluginPathError);

        if (error instanceof MissingPluginPathError) {
          expect(error.message).toEqual(MISSING_PATH);
        }
      }
    });

    it('throws error if plugin does not have path property.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              path: 'mockavizta',
              config: {
                verbose: true,
              },
            },
          },
        },
      };

      try {
        // @ts-ignore
        await initialize(context);
      } catch (error) {
        expect(error).toBeInstanceOf(MissingPluginMethodError);

        if (error instanceof MissingPluginMethodError) {
          expect(error.message).toEqual(MISSING_METHOD);
        }
      }
    });

    it('checks if builtin plugin is initalized.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              path: 'builtin',
              method: 'Mockavizta',
              config: {
                verbose: true,
              },
            },
          },
        },
      };
      // @ts-ignore
      const storage = await initialize(context);

      const pluginName = Object.keys(context.initialize.plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
    });

    it('checks if github plugin is initalized.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              path: 'https://github.com/mockavizta',
              method: 'Mockavizta',
              config: {
                verbose: true,
              },
            },
          },
        },
      };
      // @ts-ignore
      const storage = await initialize(context);

      const pluginName = Object.keys(context.initialize.plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
    });

    it('throws error if plugin path is invalid.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              path: 'failing-mock',
              method: 'Mockavizta',
              config: {
                verbose: true,
              },
            },
          },
        },
      };

      try {
        // @ts-ignore
        await initialize(context);
      } catch (error: any) {
        expect(error).toBeInstanceOf(PluginInitializationError);
        expect(error.message).toEqual(
          INVALID_MODULE_PATH(
            context.initialize.plugins.mockavizta.path,
            new Error(
              "Cannot find module 'failing-mock' from 'src/if-run/lib/initialize.ts'"
            )
          )
        );
      }
    });

    it('checks if parameter-metadata is provided.', async () => {
      const context = {
        initialize: {
          plugins: {
            'sci-embodied': {
              path: 'sci-embodied',
              method: 'SciEmbodied',
              'parameter-metadata': {
                inputs: {
                  vCPUs: {
                    description: 'number of CPUs allocated to an application',
                    unit: 'CPUs',
                    'aggregation-method': {
                      time: 'copy',
                      component: 'copy',
                    },
                  },
                },
                outputs: {
                  'embodied-carbon': {
                    description:
                      'embodied carbon for a resource, scaled by usage',
                    unit: 'gCO2eq',
                    'aggregation-method': {
                      time: 'sum',
                      component: 'sum',
                    },
                  },
                },
              },
            },
          },
        },
      };
      // @ts-ignore
      const storage = await initialize(context);

      const pluginName = Object.keys(context.initialize.plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
    });
  });
});
