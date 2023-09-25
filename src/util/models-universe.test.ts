import {describe, expect, it} from '@jest/globals';

import {ModelsUniverse} from './models-universe';
import {ImplInitializeModel} from '../types/models-universe';
import {BoaviztaCpuImpactModel} from '../lib';

describe('util/models-universe: ', () => {
  describe('init ModelsUniverse', () => {
    it('initializes object with required properties.', () => {
      const modelsHandbook = new ModelsUniverse();

      expect(typeof modelsHandbook.getInitializedModel).toBe('function');
      expect(typeof modelsHandbook.initalizedModels).toBe('object');
      expect(typeof modelsHandbook.writeDown).toBe('function');
      expect(modelsHandbook.initalizedModels).toEqual({});
    });
  });

  describe('writeDown(): ', () => {
    it('throws error in case model is not supported.', () => {
      const modelsHandbook = new ModelsUniverse();
      const modelInfo: ImplInitializeModel = {
        config: {
          allocation: 'mock-allocation',
          verbose: true,
        },
        name: 'test',
        kind: 'builtin',
      };

      const expectedMessage = `Missing or wrong model: ${modelInfo.name}.`;

      try {
        modelsHandbook.writeDown(modelInfo);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toEqual(expectedMessage);
        }
      }
    });

    it('registers `builtin` model in initalized models list.', () => {
      const modelsHandbook = new ModelsUniverse();
      const modelInfo: ImplInitializeModel = {
        config: {
          allocation: 'mock-allocation',
          verbose: true,
        },
        name: '',
        kind: 'builtin',
      };

      const models = [
        'boavizta-cpu',
        'boavizta-cloud',
        'ccf',
        'teads-aws',
        'teads-curve',
        'sci-e',
        'sci-m',
        'sci-o',
        'sci',
        'eshoppen',
        'eshoppen-net',
        'eshoppen-cpu',
        'eshoppen-mem',
        'sci-accenture',
        'emem',
        'aveva',
      ];

      models.forEach(model => {
        const completeModelInfo = {
          ...modelInfo,
          name: model,
        };
        const modelsList = modelsHandbook.writeDown(completeModelInfo);

        expect(modelsList).toHaveProperty(completeModelInfo.name);
        expect(typeof modelsList[completeModelInfo.name]).toBe('function');
      });
    });

    it('registers `shell` model in initalized models list.', () => {
      const modelsHandbook = new ModelsUniverse();
      const modelInfo: ImplInitializeModel = {
        config: {
          allocation: 'mock-allocation',
          verbose: true,
        },
        name: 'mock-name',
        kind: 'shell',
      };

      const modelsList = modelsHandbook.writeDown(modelInfo);
      expect(modelsList).toHaveProperty(modelInfo.name);
      expect(typeof modelsList[modelInfo.name]).toBe('function');
    });

    it('registers `plugin` model in initalized models list.', () => {
      const modelsHandbook = new ModelsUniverse();
      const modelInfo: ImplInitializeModel = {
        config: {
          allocation: 'mock-allocation',
          verbose: true,
        },
        name: 'mock-name',
        kind: 'plugin',
      };

      const modelsList = modelsHandbook.writeDown(modelInfo);
      expect(modelsList).toHaveProperty(modelInfo.name);
      expect(typeof modelsList[modelInfo.name]).toBe('function');
    });
  });

  describe('getInitializedModel(): ', () => {
    it('throws error in case if model is not initalized.', async () => {
      const modelsHandbook = new ModelsUniverse();

      const modelName = 'mock-modelName';
      const config = {};

      const expectedMessage = `Model: ${modelName} is not initalized yet.`;

      try {
        await modelsHandbook.getInitializedModel(modelName, config);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual(expectedMessage);
        }
      }
    });

    it('returns initalized model.', async () => {
      const modelsHandbook = new ModelsUniverse();
      const modelInfo: ImplInitializeModel = {
        config: {
          allocation: 'mock-allocation',
          verbose: true,
        },
        name: 'boavizta-cpu',
        kind: 'builtin',
      };
      modelsHandbook.writeDown(modelInfo);

      const config = {
        processor: 'intel',
        'core-units': 1,
      };

      const model = await modelsHandbook.getInitializedModel(
        modelInfo.name,
        config
      );

      expect(model).toBeInstanceOf(BoaviztaCpuImpactModel);
    });
  });
});
