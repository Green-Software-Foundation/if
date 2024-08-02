import {spawnSync} from 'child_process';
import {loadAll} from 'js-yaml';
import {ERRORS} from '@grnsft/if-core/utils';

import {Shell} from '../../../if-run/builtins/shell';

const {InputValidationError, ProcessExecutionError} = ERRORS;

jest.mock('child_process');
jest.mock('js-yaml');

describe('builtins/shell', () => {
  describe('Shell', () => {
    const globalConfig = {command: 'python3 /path/to/script.py'};
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const shell = Shell(globalConfig, parametersMetadata, {});

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(shell).toHaveProperty('metadata');
        expect(shell).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('executes with valid inputs and command.', async () => {
        const mockSpawnSync = spawnSync as jest.MockedFunction<
          typeof spawnSync
        >;
        mockSpawnSync.mockReturnValueOnce({stdout: 'mocked stdout'} as any);

        const mockLoadAll = loadAll as jest.MockedFunction<typeof loadAll>;
        mockLoadAll.mockReturnValueOnce(['mocked output'] as any);

        const inputs = [
          {
            duration: 3600,
            timestamp: '2022-01-01T00:00:00Z',
          },
        ];

        expect.assertions(2);

        await shell.execute(inputs);

        expect(mockSpawnSync).toHaveBeenCalledWith(
          'python3',
          ['/path/to/script.py'],
          {
            encoding: 'utf8',
          }
        );
        expect(mockLoadAll).toHaveBeenCalledWith('mocked stdout');
      });

      it('executes when `mapping` is provided.', async () => {
        const mapping = {
          'cpu/energy': 'energy-for-cpu',
        };
        const shell = Shell(globalConfig, parametersMetadata, mapping);
        const mockSpawnSync = spawnSync as jest.MockedFunction<
          typeof spawnSync
        >;
        mockSpawnSync.mockReturnValueOnce({stdout: 'mocked stdout'} as any);

        const mockLoadAll = loadAll as jest.MockedFunction<typeof loadAll>;
        mockLoadAll.mockReturnValueOnce([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'energy-for-cpu': 0.002,
            'memory/energy': 0.000005,
            energy: 1,
          },
        ] as any);

        const inputs = [
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'cpu/energy': 0.002,
            'memory/energy': 0.000005,
          },
        ];

        expect.assertions(3);

        const result = await shell.execute(inputs);
        expect(result).toEqual([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'energy-for-cpu': 0.002,
            'memory/energy': 0.000005,
            energy: 1,
          },
        ]);

        expect(mockSpawnSync).toHaveBeenCalledWith(
          'python3',
          ['/path/to/script.py'],
          {
            encoding: 'utf8',
          }
        );
        expect(mockLoadAll).toHaveBeenCalledWith('mocked stdout');
      });

      it('throws an error if validation fails.', async () => {
        const shell = Shell({}, parametersMetadata, {});
        const invalidInputs = [
          {duration: 3600, timestamp: '2022-01-01T00:00:00Z', command: 123},
        ];

        expect.assertions(2);
        try {
          await shell.execute(invalidInputs);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
          expect(error).toStrictEqual(
            new InputValidationError(
              '"command" parameter is required. Error code: invalid_type.'
            )
          );
        }
      });

      it('throws an error when shell could not run command.', async () => {
        const shell = Shell(globalConfig, parametersMetadata, {});
        (spawnSync as jest.Mock).mockImplementation(() => {
          throw new InputValidationError('Could not run the command');
        });

        const inputs = [
          {
            duration: 3600,
            timestamp: '2022-01-01T00:00:00Z',
          },
        ];
        expect.assertions(2);

        try {
          await shell.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(ProcessExecutionError);
          expect(error).toStrictEqual(
            new ProcessExecutionError('Could not run the command')
          );
        }
      });
    });
  });
});
