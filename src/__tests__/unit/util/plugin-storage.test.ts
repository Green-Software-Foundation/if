import {pluginStorage} from '../../../util/plugin-storage';
import {ERRORS} from '../../../util/errors';

const {PluginInitializationError} = ERRORS;

describe('util/pluginStorage: ', () => {
  describe('pluginStorage(): ', () => {
    describe('init(): ', () => {
      it('should have get and set properties after initalization.', () => {
        const storage = pluginStorage();

        expect(storage).toHaveProperty('get');
        expect(storage).toHaveProperty('set');
        expect(typeof storage.get).toEqual('function');
        expect(typeof storage.set).toEqual('function');
      });
    });

    const pluginName = 'mock-plugin';
    const pluginBody = {
      execute: () => [{}],
      metadata: {kind: 'mock-kind'},
    };

    describe('get(): ', () => {
      it('throws error if record is not found.', () => {
        const storage = pluginStorage();
        const pluginName = 'mock-plugin';

        try {
          storage.get(pluginName);
        } catch (error) {
          expect(error).toBeInstanceOf(PluginInitializationError);

          if (error instanceof PluginInitializationError) {
            expect(error.message).toEqual;
          }
        }
      });

      it('gets data if there is stored one.', () => {
        const storage = pluginStorage();
        storage.set(pluginName, pluginBody);

        const plugin = storage.get(pluginName);

        expect(plugin).toEqual(pluginBody);
      });
    });

    describe('set(): ', () => {
      it('returns storage instance.', () => {
        const storage = pluginStorage();
        const instance = storage.set(pluginName, pluginBody);

        expect(instance).toEqual(storage);
      });

      it('stores given data.', () => {
        const storage = pluginStorage();
        const instance = storage.set(pluginName, pluginBody);

        expect(instance.get(pluginName)).toEqual(pluginBody);
      });
    });
  });
});
