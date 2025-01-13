jest.mock('fs/promises', () => require('../../../__mocks__/fs'));

import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import {ERRORS} from '@grnsft/if-core/utils';

import {CSVImport} from '../../../if-run/builtins';

import {STRINGS} from '../../../if-run/config';

const {
  ConfigError,
  ReadFileError,
  FetchingFileError,
  MissingCSVColumnError,
  CSVParseError,
} = ERRORS;
const {MISSING_CONFIG, MISSING_CSV_COLUMN} = STRINGS;

describe('builtins/CSVImport: ', () => {
  const mock = new AxiosMockAdapter(axios);

  describe('CSVImport: ', () => {
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    afterEach(() => {
      mock.reset();
    });

    describe('init: ', () => {
      it('successfully initalized.', () => {
        const config = {
          filepath: '',
          output: ['cpu-tdp', 'tdp'],
        };

        const csvImport = CSVImport(config, parametersMetadata, {});

        expect(csvImport).toHaveProperty('metadata');
        expect(csvImport).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies CSVImport `url` strategy to given input.', async () => {
        const config = {
          filepath:
            'https://raw.githubusercontent.com/Green-Software-Foundation/if-data/main/cloud-metdata-aws-instances.csv',
          output: [['cpu-cores-utilized'], ['cpu-tdp']],
        };

        const csvImport = CSVImport(config, parametersMetadata, {});
        const responseData = `cpu-cores-available,cpu-cores-utilized,cpu-manufacturer,cpu-model-name,cpu-tdp,gpu-count,gpu-model-name,Hardware Information on AWS Documentation & Comments,instance-class,instance-storage,memory-available,platform-memory,release-date,storage-drives
16,8,AWS,AWS Graviton,150.00,N/A,N/A,AWS Graviton (ARM),a1.2xlarge,EBS-Only,16,32,November 2018,0
16,16,AWS,AWS Graviton,150.00,N/A,N/A,AWS Graviton (ARM),a1.4xlarge,EBS-Only,32,32,November 2018,0`;
        mock.onGet(config.filepath).reply(200, responseData);

        const result = await csvImport.execute([]);
        const expectedResult = [
          {
            'cpu-cores-utilized': 8,
            'cpu-tdp': 150,
          },
          {
            'cpu-cores-utilized': 16,
            'cpu-tdp': 150,
          },
        ];

        expect.assertions(1);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully applies CSVImport `local file` strategy to given input.', async () => {
        expect.assertions(1);
        const config = {
          filepath: './file.csv',
          output: [
            ['cpu-cores-available'],
            ['cpu-cores-utilized'],
            ['cpu-manufacturer'],
            ['cpu-tdp', 'tdp'],
          ],
        };

        const csvImport = CSVImport(config, parametersMetadata, {});
        const result = await csvImport.execute([]);
        const expectedResult = [
          {
            'cpu-cores-available': 16,
            'cpu-cores-utilized': 8,
            'cpu-manufacturer': 'AWS',
            tdp: 150,
          },
          {
            'cpu-cores-available': 16,
            'cpu-cores-utilized': 16,
            'cpu-manufacturer': 'AWS',
            tdp: 150,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when the file is empty.', async () => {
        const config = {
          filepath:
            'https://raw.githubusercontent.com/Green-Software-Foundation/if-data/main/cloud-metdata-aws-instances.csv',
          output: [['cpu-cores-utilized'], ['cpu-tdp']],
        };

        const csvImport = CSVImport(config, parametersMetadata, {});
        const responseData = '';
        mock.onGet(config.filepath).reply(200, responseData);

        const result = await csvImport.execute([]);

        expect.assertions(1);

        expect(result).toStrictEqual([]);
      });

      it('successfully executes when `mapping` has valid data.', async () => {
        expect.assertions(1);
        const config = {
          filepath: './file.csv',
          output: [
            ['cpu-cores-utilized', 'cpu/utilized'],
            ['cpu-tdp', 'tdp'],
          ],
        };
        const parameterMetadata = {inputs: {}, outputs: {}};
        const mapping = {
          'cpu/utilized': 'cpu/util',
        };
        const csvImport = CSVImport(config, parameterMetadata, mapping);

        const result = await csvImport.execute([]);
        const expectedResult = [
          {
            'cpu/util': 8,
            tdp: 150,
          },
          {
            'cpu/util': 16,
            tdp: 150,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('rejects with file not found error.', async () => {
        const config = {
          filepath: './file-fail.csv',
          output: ['cpu-tdp', 'tdp'],
        };

        const csvImport = CSVImport(config, parametersMetadata, {});

        try {
          await csvImport.execute([]);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(ReadFileError);
          }
        }
      });

      it('rejects with axios error.', async () => {
        const config = {
          filepath:
            'https://raw.githubusercontent.com/Green-Software-Foundation/if-data/main/cloud-metdata-aws-instances.csv',
          output: ['cpu-tdp', 'tdp'],
        };
        mock.onGet(config.filepath).reply(404);

        const csvImport = CSVImport(config, parametersMetadata, {});

        try {
          await csvImport.execute([]);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(FetchingFileError);
          }
        }
      });

      it('successfully applies CSVImport if output is `*`.', async () => {
        expect.assertions(1);
        const config = {
          filepath: './file.csv',
          output: '*',
        };
        const csvImport = CSVImport(config, parametersMetadata, {});
        const result = await csvImport.execute([
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ]);
        const expectedResult = [
          {
            'cpu/available': 16,
            'cpu/manufacturer': 'AWS',
            'cpu/utilized': 16,
            timestamp: '2024-03-01',
          },
          {
            'Hardware Information on AWS Documentation & Comments':
              'AWS Graviton (ARM)',
            'cpu-cores-available': 16,
            'cpu-cores-utilized': 8,
            'cpu-manufacturer': 'AWS',
            'cpu-model-name': 'AWS Graviton',
            'cpu-tdp': 150,

            'gpu-count': 'N/A',
            'gpu-model-name': 'N/A',
            'instance-class': 'a1.2xlarge',
            'instance-storage': 'EBS-Only',
            'memory-available': 16,
            'platform-memory': 32,
            'release-date': 'November 2018',
            'storage-drives': 'nan',
          },
          {
            'Hardware Information on AWS Documentation & Comments':
              'AWS Graviton (ARM)',
            'cpu-cores-available': 16,
            'cpu-cores-utilized': 16,
            'cpu-manufacturer': 'AWS',
            'cpu-model-name': 'AWS Graviton',
            'cpu-tdp': 150,
            'gpu-count': 'N/A',
            'gpu-model-name': 'N/A',
            'instance-class': 'a1.4xlarge',
            'instance-storage': 'EBS-Only',
            'memory-available': 32,
            'platform-memory': 32,
            'release-date': 'November 2018',
            'storage-drives': 'nan',
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully applies CSVImport if output is exact string.', async () => {
        expect.assertions(1);
        const config = {
          filepath: './file.csv',
          output: 'cpu-tdp',
        };

        const csvImport = CSVImport(config, parametersMetadata, {});
        const result = await csvImport.execute([]);
        const expectedResult = [
          {
            'cpu-tdp': 150,
          },
          {
            'cpu-tdp': 150,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('rejects with config not found error.', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const csvImport = CSVImport();
        expect.assertions(2);

        try {
          await csvImport.execute([]);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(ConfigError);
            expect(error.message).toEqual(MISSING_CONFIG);
          }
        }
      });

      it('rejects with no such column in csv error.', async () => {
        expect.assertions(2);

        const config = {
          filepath: './file.csv',
          output: 'mock',
        };
        const csvImport = CSVImport(config, parametersMetadata, {});
        const input = [
          {
            timestamp: '2024-03-01',
            'cpu/available': 16,
            'cpu/utilized': 16,
            'cpu/manufacturer': 'AWS',
          },
        ];

        try {
          await csvImport.execute(input);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(MissingCSVColumnError);
            expect(error.message).toEqual(MISSING_CSV_COLUMN(config.output));
          }
        }
      });

      it('successfully applies CSVImport if output is array with string.', async () => {
        expect.assertions(1);
        const config = {
          filepath: './file.csv',
          output: ['cpu-cores-utilized'],
        };

        const csvImport = CSVImport(config, parametersMetadata, {});
        const result = await csvImport.execute([]);
        const expectedResult = [
          {
            'cpu-cores-utilized': 8,
          },
          {
            'cpu-cores-utilized': 16,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully applies CSVImport if output is matrix with strings.', async () => {
        expect.assertions(1);
        const config = {
          filepath: './file.csv',
          output: [['cpu-cores-utilized']],
        };

        const csvImport = CSVImport(config, parametersMetadata, {});
        const result = await csvImport.execute([]);
        const expectedResult = [
          {
            'cpu-cores-utilized': 8,
          },
          {
            'cpu-cores-utilized': 16,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('rejects with CSV parse error.', async () => {
        process.env.csv = 'fail';
        expect.assertions(1);
        const config = {
          filepath: './fail-csv-reader.csv',
          output: [['gpu-count']],
        };

        const csvImport = CSVImport(config, parametersMetadata, {});

        try {
          await csvImport.execute([
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
});
