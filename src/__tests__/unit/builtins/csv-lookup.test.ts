jest.mock('fs/promises', () => require('../../../__mocks__/fs'));

import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';

import {CSVLookup} from '../../../builtins';

import {STRINGS} from '../../../config';

import {ERRORS} from '../../../util/errors';

const {
  GlobalConfigError,
  ReadFileError,
  FetchingFileError,
  QueryDataNotFoundError,
  MissingCSVColumnError,
  CSVParseError,
} = ERRORS;
const {MISSING_GLOBAL_CONFIG, MISSING_CSV_COLUMN, NO_QUERY_DATA} = STRINGS;

describe('builtins/CSVLookup: ', () => {
  const mock = new AxiosMockAdapter(axios);

  describe('CSVLookup: ', () => {
    afterEach(() => {
      mock.reset();
    });

    describe('init: ', () => {
      it('successfully initalized.', () => {
        const globalConfig = {
          filepath: '',
          query: {
            'cpu-cores-available': 'cpu/available',
          },
          output: ['cpu-tdp', 'tdp'],
        };
        const csvLookup = CSVLookup(globalConfig);
        expect(csvLookup).toHaveProperty('metadata');
        expect(csvLookup).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies CSVLookup `url` strategy to given input.', async () => {
        expect.assertions(1);
        const globalConfig = {
          filepath:
            'https://raw.githubusercontent.com/Green-Software-Foundation/if-data/main/cloud-metdata-aws-instances.csv',
          query: {
            'cpu-cores-available': 'cpu/available',
            'cpu-cores-utilized': 'cpu/utilized',
            'cpu-manufacturer': 'cpu/manufacturer',
          },
          output: ['cpu-tdp', 'tdp'],
        };
        const csvLookup = CSVLookup(globalConfig);

        const responseData = `cpu-cores-available,cpu-cores-utilized,cpu-manufacturer,cpu-model-name,cpu-tdp,gpu-count,gpu-model-name,Hardware Information on AWS Documentation & Comments,instance-class,instance-storage,memory-available,platform-memory,release-date,storage-drives
16,8,AWS,AWS Graviton,150.00,N/A,N/A,AWS Graviton (ARM),a1.2xlarge,EBS-Only,16,32,November 2018,0
16,16,AWS,AWS Graviton,150.00,N/A,N/A,AWS Graviton (ARM),a1.4xlarge,EBS-Only,32,32,November 2018,0`;
        mock.onGet(globalConfig.filepath).reply(200, responseData);

        const result = await csvLookup.execute([
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ]);
        const expectedResult = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
            tdp: 150,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully applies CSVLookup `local file` strategy to given input.', async () => {
        expect.assertions(1);
        const globalConfig = {
          filepath: './file.csv',
          query: {
            'cpu-cores-available': 'cpu/available',
            'cpu-cores-utilized': 'cpu/utilized',
            'cpu-manufacturer': 'cpu/manufacturer',
          },
          output: ['cpu-tdp', 'tdp'],
        };
        const csvLookup = CSVLookup(globalConfig);

        const result = await csvLookup.execute([
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ]);
        const expectedResult = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
            tdp: 150,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('rejects with file not found error.', async () => {
        const globalConfig = {
          filepath: './file-fail.csv',
          query: {
            'cpu-cores-available': 'cpu/available',
            'cpu-cores-utilized': 'cpu/utilized',
            'cpu-manufacturer': 'cpu/manufacturer',
          },
          output: ['cpu-tdp', 'tdp'],
        };
        const csvLookup = CSVLookup(globalConfig);
        const input = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ];

        try {
          await csvLookup.execute(input);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(ReadFileError);
          }
        }
      });

      it('rejects with file not found error.', async () => {
        const globalConfig = {
          filepath: './file-fail.csv',
          query: {
            'cpu-cores-available': 'cpu/available',
            'cpu-cores-utilized': 'cpu/utilized',
            'cpu-manufacturer': 'cpu/manufacturer',
          },
          output: ['cpu-tdp', 'tdp'],
        };
        const csvLookup = CSVLookup(globalConfig);
        const input = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ];

        try {
          await csvLookup.execute(input);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(ReadFileError);
          }
        }
      });

      it('rejects with axios error.', async () => {
        const globalConfig = {
          filepath:
            'https://raw.githubusercontent.com/Green-Software-Foundation/if-data/main/cloud-metdata-aws-instances.csv',
          query: {
            'cpu-cores-available': 'cpu/available',
            'cpu-cores-utilized': 'cpu/utilized',
            'cpu-manufacturer': 'cpu/manufacturer',
          },
          output: ['cpu-tdp', 'tdp'],
        };
        mock.onGet(globalConfig.filepath).reply(404);

        const csvLookup = CSVLookup(globalConfig);
        const input = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ];

        try {
          await csvLookup.execute(input);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(FetchingFileError);
          }
        }
      });

      it('successfully applies CSVLookup if output is `*`.', async () => {
        expect.assertions(1);
        const globalConfig = {
          filepath: './file.csv',
          query: {
            'cpu-cores-available': 'cpu/available',
            'cpu-cores-utilized': 'cpu/utilized',
            'cpu-manufacturer': 'cpu/manufacturer',
          },
          output: '*',
        };
        const csvLookup = CSVLookup(globalConfig);

        const result = await csvLookup.execute([
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ]);
        const expectedResult = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
            'gpu-count': 'N/A',
            'gpu-model-name': 'N/A',
            'instance-class': 'a1.4xlarge',
            'instance-storage': 'EBS-Only',
            'memory-available': 32,
            'platform-memory': 32,
            'release-date': 'November 2018',
            'storage-drives': 'nan',
            'Hardware Information on AWS Documentation & Comments':
              'AWS Graviton (ARM)',
            'cpu-model-name': 'AWS Graviton',
            'cpu-tdp': 150,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully applies CSVLookup if output is matrix.', async () => {
        expect.assertions(1);
        const globalConfig = {
          filepath: './file.csv',
          query: {
            'cpu-cores-available': 'cpu/available',
            'cpu-cores-utilized': 'cpu/utilized',
            'cpu-manufacturer': 'cpu/manufacturer',
          },
          output: [
            ['gpu-count', 'gpuc'],
            ['gpu-model-name', 'gpumodel'],
          ],
        };
        const csvLookup = CSVLookup(globalConfig);

        const result = await csvLookup.execute([
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ]);
        const expectedResult = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
            gpuc: 'N/A',
            gpumodel: 'N/A',
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully applies CSVLookup if output is exact string.', async () => {
        expect.assertions(1);
        const globalConfig = {
          filepath: './file.csv',
          query: {
            'cpu-cores-available': 'cpu/available',
            'cpu-cores-utilized': 'cpu/utilized',
            'cpu-manufacturer': 'cpu/manufacturer',
          },
          output: 'gpu-count',
        };
        const csvLookup = CSVLookup(globalConfig);

        const result = await csvLookup.execute([
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ]);
        const expectedResult = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
            'gpu-count': 'N/A',
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('rejects with query data not found.', async () => {
        expect.assertions(2);
        const globalConfig = {
          filepath: './file.csv',
          query: {
            'fail-cpu-cores-available': 'cpu/available',
            'fail-cpu-cores-utilized': 'cpu/utilized',
            'fail-cpu-manufacturer': 'cpu/manufacturer',
          },
          output: ['cpu-tdp', 'tdp'],
        };

        const csvLookup = CSVLookup(globalConfig);
        const input = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ];

        try {
          await csvLookup.execute(input);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(QueryDataNotFoundError);
            expect(error.message).toEqual(NO_QUERY_DATA);
          }
        }
      });

      it('rejects with config not found error.', async () => {
        expect.assertions(2);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const csvLookup = CSVLookup();
        const input = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ];

        try {
          await csvLookup.execute(input);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(GlobalConfigError);
            expect(error.message).toEqual(MISSING_GLOBAL_CONFIG);
          }
        }
      });

      it('rejects with no such column in csv error.', async () => {
        expect.assertions(2);

        const globalConfig = {
          filepath: './file.csv',
          query: {
            'cpu-cores-available': 'cpu/available',
            'cpu-cores-utilized': 'cpu/utilized',
            'cpu-manufacturer': 'cpu/manufacturer',
          },
          output: 'mock',
        };
        const csvLookup = CSVLookup(globalConfig);
        const input = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ];

        try {
          await csvLookup.execute(input);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(MissingCSVColumnError);
            expect(error.message).toEqual(
              MISSING_CSV_COLUMN(globalConfig.output)
            );
          }
        }
      });

      it('successfully applies CSVLookup if output is array with string.', async () => {
        expect.assertions(1);
        const globalConfig = {
          filepath: './file.csv',
          query: {
            'cpu-cores-available': 'cpu/available',
            'cpu-cores-utilized': 'cpu/utilized',
            'cpu-manufacturer': 'cpu/manufacturer',
          },
          output: ['gpu-count'],
        };
        const csvLookup = CSVLookup(globalConfig);

        const result = await csvLookup.execute([
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ]);
        const expectedResult = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
            'gpu-count': 'N/A',
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully applies CSVLookup if output is matrix with strings.', async () => {
        expect.assertions(1);
        const globalConfig = {
          filepath: './file.csv',
          query: {
            'cpu-cores-available': 'cpu/available',
            'cpu-cores-utilized': 'cpu/utilized',
            'cpu-manufacturer': 'cpu/manufacturer',
          },
          output: [['gpu-count']],
        };
        const csvLookup = CSVLookup(globalConfig);

        const result = await csvLookup.execute([
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ]);
        const expectedResult = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
            'gpu-count': 'N/A',
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });
    });

    it('rejects with CSV parse error', async () => {
      process.env.csv = 'fail';
      expect.assertions(1);
      const globalConfig = {
        filepath: './fail-csv-reader.csv',
        query: {
          'cpu-cores-available': 'cpu/available',
          'cpu-cores-utilized': 'cpu/utilized',
          'cpu-manufacturer': 'cpu/manufacturer',
        },
        output: [['gpu-count']],
      };
      const csvLookup = CSVLookup(globalConfig);

      try {
        await csvLookup.execute([
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ]);
      } catch (error) {
        expect(error).toBeInstanceOf(CSVParseError);
      }
    });
  });
});
