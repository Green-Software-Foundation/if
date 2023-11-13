import {MockModel} from '../../../__mocks__/model-universe';

import {ModelsUniverse} from '../../../lib/models-universe';

import {STRINGS} from '../../../config';

import {ImplInitializeModel} from '../../../types/models-universe';

const {
  MISSING_CLASSNAME,
  MISSING_PATH,
  NOT_OUTPUT_MODEL_EXTENSION,
  NOT_INITIALIZED_MODEL,
} = STRINGS;

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
    beforeEach(() => {
      jest.resetModules();
      jest.restoreAllMocks();
    });

    it('throws error in case model is not supported.', () => {
      const modelsHandbook = new ModelsUniverse();
      const modelInfo: ImplInitializeModel = {
        config: {
          allocation: 'mock-allocation',
          verbose: true,
        },
        name: 'test',
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

    it('registers `shell` model in initalized models list.', () => {
      const modelsHandbook = new ModelsUniverse();
      const modelInfo: ImplInitializeModel = {
        config: {
          allocation: 'mock-allocation',
          verbose: true,
        },
        name: 'mock-name',
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
      };

      const modelsList = modelsHandbook.writeDown(modelInfo);
      expect(modelsList).toHaveProperty(modelInfo.name);
      expect(typeof modelsList[modelInfo.name]).toBe('function');
    });

    it('throws `missing classname` error while registration of `plugin` model.', async () => {
      const modelsHandbook = new ModelsUniverse();
      const modelInfo: ImplInitializeModel = {
        config: {
          allocation: 'mock-allocation',
          verbose: true,
        },
        name: 'mock-name',
      };

      const modelsList = modelsHandbook.writeDown(modelInfo);
      const model = modelsList[modelInfo.name];

      expect.assertions(2);

      try {
        await model({
          'core-units': 1,
          'physical-processor': 'intel',
        });
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual(MISSING_CLASSNAME);
        }
      }
    });

    it('throws `missing path parameter` error while registration of `plugin` model.', async () => {
      const modelsHandbook = new ModelsUniverse();
      const modelInfo: ImplInitializeModel = {
        config: {
          allocation: 'mock-allocation',
          verbose: true,
        },
        name: 'mock-name',
        model: 'MockaviztaModel',
      };

      const modelsList = modelsHandbook.writeDown(modelInfo);
      const model = modelsList[modelInfo.name];

      expect.assertions(2);

      try {
        await model({
          'core-units': 1,
          'physical-processor': 'intel',
        });
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual(MISSING_PATH);
        }
      }
    });

    it('should successfully initalize plugin model.', async () => {
      jest.mock(
        'mockavizta-model',
        () => ({
          __esModule: true,
          MockaviztaModel: MockModel,
        }),
        {virtual: true}
      );

      const modelsHandbook = new ModelsUniverse();
      const modelInfo: ImplInitializeModel = {
        config: {
          allocation: 'mock-allocation',
          verbose: true,
        },
        name: 'mock-name',
        model: 'MockaviztaModel',
        path: 'https://github.com/mock/mockavizta-model',
      };

      const modelsList = modelsHandbook.writeDown(modelInfo);
      const model = modelsList[modelInfo.name];

      expect.assertions(1);

      const response = await model({
        'core-units': 1,
        'physical-processor': 'intel',
      });

      expect(response).toBeInstanceOf(MockModel);
    });

    it('should throw `input model does not extend base interface` error.', async () => {
      jest.mock(
        'mockavizta-model',
        () => ({
          __esModule: true,
          MockaviztaModel: class FakeModel {},
        }),
        {virtual: true}
      );

      const modelsHandbook = new ModelsUniverse();
      const modelInfo: ImplInitializeModel = {
        config: {
          allocation: 'mock-allocation',
          verbose: true,
        },
        name: 'mock-name',
        model: 'MockaviztaModel',
        path: 'https://github.com/mock/mockavizta-model',
      };

      const modelsList = modelsHandbook.writeDown(modelInfo);
      const model = modelsList[modelInfo.name];

      expect.assertions(2);

      try {
        await model({
          'core-units': 1,
          'physical-processor': 'intel',
        });
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual(NOT_OUTPUT_MODEL_EXTENSION);
        }
      }
    });
  });

  describe('getInitializedModel(): ', () => {
    it('throws error in case if model is not initalized.', async () => {
      const modelsHandbook = new ModelsUniverse();

      const modelName = 'mock-modelName';
      const config = {};

      const expectedMessage = NOT_INITIALIZED_MODEL(modelName);

      try {
        await modelsHandbook.getInitializedModel(modelName, config);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual(expectedMessage);
        }
      }
    });
  });
});
