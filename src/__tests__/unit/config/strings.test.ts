import {STRINGS} from '../../../config/strings';

const {
  NOT_NATIVE_PLUGIN,
  INVALID_MODULE_PATH,
  INVALID_AGGREGATION_METHOD,
  METRIC_MISSING,
  AVOIDING_PADDING,
  AVOIDING_PADDING_BY_EDGES,
  INVALID_GROUP_BY,
  REJECTING_OVERRIDE,
  INVALID_EXHAUST_PLUGIN,
  UNKNOWN_PARAM,
  NOT_INITALIZED_PLUGIN,
} = STRINGS;

describe('config/strings: ', () => {
  describe('NOT_NATIVE_PLUGIN(): ', () => {
    it('successfully injects path into message.', () => {
      const path = 'mock/path';
      const expectedMessage = `
You are using plugin ${path} which is not part of the Impact Framework standard library. You should do your own research to ensure the plugins are up to date and accurate. They may not be actively maintained.`;

      expect(NOT_NATIVE_PLUGIN(path)).toEqual(expectedMessage);
    });
  });

  describe('INVALID_MODULE_PATH(): ', () => {
    it('successfully appends given param to message.', () => {
      const param = 'mock-param';

      const expectedMessage = `Provided module: '${param}' is invalid or not found.`;

      expect(INVALID_MODULE_PATH(param)).toEqual(expectedMessage);
    });
  });

  describe('AVOIDING_PADDING(): ', () => {
    it('successfully appends given param to message.', () => {
      const param = 'mock-param';

      const expectedMessage = `Avoiding padding at ${param}`;

      expect(AVOIDING_PADDING(param)).toEqual(expectedMessage);
    });
  });

  describe('AVOIDING_PADDING_BY_EDGES(): ', () => {
    it('successfully appends given start and end params.', () => {
      const start = true;
      const end = true;

      const expectedMessage = 'Avoiding padding at start and end';

      expect(AVOIDING_PADDING_BY_EDGES(start, end)).toEqual(expectedMessage);
    });

    it('successfully appends given start param.', () => {
      const start = true;
      const end = false;

      const expectedMessage = 'Avoiding padding at start';

      expect(AVOIDING_PADDING_BY_EDGES(start, end)).toEqual(expectedMessage);
    });

    it('successfully appends given end param.', () => {
      const start = false;
      const end = true;

      const expectedMessage = 'Avoiding padding at end';

      expect(AVOIDING_PADDING_BY_EDGES(start, end)).toEqual(expectedMessage);
    });
  });

  describe('INVALID_AGGREGATION_METHOD(): ', () => {
    it('successfully appends given param to message.', () => {
      const param = 'mock-param';

      const expectedMessage = `Aggregation is not possible for given ${param} since method is 'none'.`;

      expect(INVALID_AGGREGATION_METHOD(param)).toEqual(expectedMessage);
    });
  });

  describe('METRIC_MISSING(): ', () => {
    it('successfully appends given param to message.', () => {
      const metric = 'mock-metric';
      const index = 0;

      const expectedMessage = `Aggregation metric ${metric} is not found in inputs[${index}].`;

      expect(METRIC_MISSING(metric, index)).toEqual(expectedMessage);
    });
  });

  describe('INVALID_GROUP_BY(): ', () => {
    it('injects type in given message.', () => {
      const type = 'mock-type';
      const message = `Invalid group ${type}.`;

      expect(INVALID_GROUP_BY(type)).toEqual(message);
    });
  });

  describe('REJECTING_OVERRIDE(): ', () => {
    it('inejcts param name into message.', () => {
      const param: any = {
        name: 'mock-name',
        description: 'mock-description',
        aggregation: 'sum',
        unit: 'mock-unit',
      };

      expect(REJECTING_OVERRIDE(param));
    });
  });

  describe('INVALID_EXHAUST_PLUGIN(): ', () => {
    it('injects plugin name into message.', () => {
      const pluginName = 'mock-plugin';
      const message = `Invalid exhaust plugin: ${pluginName}.`;

      expect(INVALID_EXHAUST_PLUGIN(pluginName)).toEqual(message);
    });
  });

  describe('AVOIDING_PADDING(): ', () => {
    it('successfully appends given param to message.', () => {
      const description_suffix = 'pad description';

      const expectedMessage = `Avoiding padding at ${description_suffix}`;

      expect(AVOIDING_PADDING(description_suffix)).toEqual(expectedMessage);
    });
  });

  describe('UNKNOWN_PARAM(): ', () => {
    it('injects name into message.', () => {
      const name = 'mock-name';
      const message = `Unknown parameter: ${name}. Using 'sum' aggregation method.`;

      expect(UNKNOWN_PARAM(name)).toEqual(message);
    });
  });

  describe('NOT_INITALIZED_PLUGIN(): ', () => {
    it('injects name into message.', () => {
      const name = 'mock-name';
      const message = `Not initalized plugin: ${name}. Check if ${name} is in 'manifest.initalize.plugins'.`;

      expect(NOT_INITALIZED_PLUGIN(name)).toEqual(message);
    });
  });

  describe('AVOIDING_PADDING_BY_EDGES(): ', () => {
    it('successfully combines boolean params into a description.', () => {
      let description_suffix = 'start and end';
      let expectedMessage = `Avoiding padding at ${description_suffix}`;

      expect(AVOIDING_PADDING_BY_EDGES(true, true)).toEqual(expectedMessage);
      description_suffix = 'start';
      expectedMessage = `Avoiding padding at ${description_suffix}`;
      expect(AVOIDING_PADDING_BY_EDGES(true, false)).toEqual(expectedMessage);
      description_suffix = 'end';
      expectedMessage = `Avoiding padding at ${description_suffix}`;
      expect(AVOIDING_PADDING_BY_EDGES(false, true)).toEqual(expectedMessage);
    });
  });
});
