import {STRINGS} from '../../../config/strings';

const {
  INVALID_MODULE_PATH,
  INVALID_AGGREGATION_METHOD,
  METRIC_MISSING,
  AVOIDING_PADDING,
  AVOIDING_PADDING_BY_EDGES,
} = STRINGS;

describe('config/strings: ', () => {
  describe('INVALID_MODULE_PATH(): ', () => {
    it('successfully appends given param to message.', () => {
      const param = 'mock-param';

      const expectedMessage = `Provided module path: '${param}' is invalid or not found.`;

      expect(INVALID_MODULE_PATH(param)).toEqual(expectedMessage);
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

  describe('AVOIDING_PADDING(): ', () => {
    it('successfully appends given param to message.', () => {
      const description_suffix = 'pad description';

      const expectedMessage = `Avoiding padding at ${description_suffix}`;

      expect(AVOIDING_PADDING(description_suffix)).toEqual(expectedMessage);
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
