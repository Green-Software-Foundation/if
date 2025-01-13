import {execFileSync} from 'child_process';

jest.mock('node:readline/promises', () =>
  require('../../../__mocks__/readline')
);

jest.mock('child_process', () => {
  const originalModule = jest.requireActual('child_process');
  return {
    ...originalModule,
    execFileSync: jest.fn(() => {
      return 'Command executed successfully';
    }),
  };
});

import {
  parseManifestFromStdin,
  runHelpCommand,
} from '../../../common/util/helpers';

describe('common/util/helpers: ', () => {
  describe('parseManifestFromStdin(): ', () => {
    it('returns empty string if there is no data in stdin.', async () => {
      const response = await parseManifestFromStdin();
      const expectedResult = '';

      expect(response).toEqual(expectedResult);
    });

    it('returns empty string if nothing is piped.', async () => {
      const originalIsTTY = process.stdin.isTTY;
      process.stdin.isTTY = true;
      const response = await parseManifestFromStdin();
      const expectedResult = '';

      expect(response).toEqual(expectedResult);
      process.stdin.isTTY = originalIsTTY;
    });

    it('throws error if there is no manifest in stdin.', async () => {
      process.env.readline = 'no_manifest';
      expect.assertions(1);

      const response = await parseManifestFromStdin();

      expect(response).toEqual('');
    });

    it('returns empty string if there is no data in stdin.', async () => {
      process.env.readline = 'manifest';
      const response = await parseManifestFromStdin();
      const expectedMessage =
        '\nname: mock-name\ndescription: mock-description\n';
      expect.assertions(1);
      expect(response).toEqual(expectedMessage);
    });
  });

  describe('runHelpCommand(): ', () => {
    const originalEnv = process.env;
    it('calls process.exit with code 1 on error.', () => {
      expect.assertions(3);

      jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
        expect(code).toEqual(1);
        throw new Error(`process.exit(${code}) called`);
      });

      expect(() => runHelpCommand('if-run')).toThrow('process.exit(1) called');
      expect(execFileSync).toHaveBeenCalledWith(
        'npm',
        ['run', 'if-run', '--silent', '--', '-h'],
        {
          cwd: process.env.CURRENT_DIR || process.cwd(),
          stdio: 'inherit',
          shell: false,
        }
      );
    });

    it('executes when the script runs from the global.', () => {
      expect.assertions(3);
      process.env.npm_config_global = 'true';

      jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
        expect(code).toEqual(1);
        throw new Error(`process.exit(${code}) called`);
      });

      expect(() => runHelpCommand('if-run')).toThrow('process.exit(1) called');
      expect(execFileSync).toHaveBeenCalledWith(
        'if-run',
        ['--silent', '--', '-h'],
        {
          cwd: process.env.CURRENT_DIR || process.cwd(),
          stdio: 'inherit',
          shell: false,
        }
      );
    });

    process.env = originalEnv;
  });
});
