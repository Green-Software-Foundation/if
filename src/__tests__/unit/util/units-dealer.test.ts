import {UnitsDealer} from '../../../util/units-dealer';
import {ERRORS} from '../../../util/errors';

jest.mock('../../../util/yaml.ts', () => {
  return {
    __esModule: true,
    openYamlFileAsObject: () => {
      if (process.env.REJECT_READ === 'true') {
        return Promise.reject(new Error('mock-error'));
      }

      return Promise.resolve({
        'cpu-util': {
          aggregation: 'avg',
        },
      });
    },
  };
});

const {FileNotFoundError} = ERRORS;

describe('util/units-dealer: ', () => {
  const originalEnv = process.env;

  describe('UnitsDealer(): ', () => {
    describe('init(): ', () => {
      it('has all the necessary props.', async () => {
        process.env.REJECT_READ = 'false';
        const dealer = await UnitsDealer();

        expect.assertions(1);

        expect(dealer).toHaveProperty('askToGiveMethodFor');
      });

      it('fails to init, if units file is not reachable.', async () => {
        process.env.REJECT_READ = 'true';

        expect.assertions(1);
        const message = 'mock-error';

        try {
          await UnitsDealer();
        } catch (error) {
          expect(error).toEqual(new FileNotFoundError(message));
        }
      });
    });

    describe('askToGiveMethodFor(): ', () => {
      it('check if `sum` is returned for non existant unit.', async () => {
        process.env.REJECT_READ = 'false';
        const dealer = await UnitsDealer();

        expect.assertions(1);

        const nonExistantMetric = 'mock';
        const expectedResult = 'sum';

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(dealer.askToGiveMethodFor(nonExistantMetric)).toBe(
          expectedResult
        );
      });

      it('returns aggregation method for `cpu-util`.', async () => {
        process.env.REJECT_READ = 'false';
        const dealer = await UnitsDealer();

        expect.assertions(1);

        const metric = 'cpu-util';
        const expectedResult = 'avg';

        expect(dealer.askToGiveMethodFor(metric)).toBe(expectedResult);
      });
    });
  });

  process.env = originalEnv;
});
