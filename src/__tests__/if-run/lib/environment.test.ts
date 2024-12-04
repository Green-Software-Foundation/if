/* eslint-disable @typescript-eslint/ban-ts-comment */
import {execPromise} from '../../../common/util/helpers';

jest.mock('../../../common/util/helpers', () => {
  const originalModule = jest.requireActual('../../../common/util/helpers');

  return {
    ...originalModule,
    execPromise: jest.fn(async (...args) => {
      if (process.env.EXECUTE === 'invalid') {
        return {
          stdout: JSON.stringify({
            version: '0.7.2',
            name: '@grnsft/if',
          }),
        };
      } else if (process.env.EXECUTE === 'true') {
        return {
          stdout: JSON.stringify({
            version: '0.7.2',
            name: '@grnsft/if',
            dependencies: {
              'release-iterator': {
                version: '0.7.2',
                resolved: 'git@github.com:Green-Software-Foundation/if.git',
                overridden: false,
              },
            },
          }),
        };
      }

      return originalModule.execPromise(...args);
    }),
  };
});

import {injectEnvironment} from '../../../if-run/lib/environment';

describe('lib/environment: ', () => {
  describe('injectEnvironment(): ', () => {
    const context = {};

    it('checks response to have `execution` property.', async () => {
      // @ts-ignore
      const response = await injectEnvironment(context);

      expect.assertions(1);
      expect(response).toHaveProperty('execution');
    }, 6000);

    it('checks `execution` to have `command` and `environment` props.', async () => {
      // @ts-ignore
      const response = await injectEnvironment(context);
      const {execution} = response;

      expect.assertions(2);
      expect(execution).toHaveProperty('command');
      expect(execution).toHaveProperty('environment');
    });

    it('checks if dependency has github link.', async () => {
      process.env.EXECUTE = 'true';
      // @ts-ignore
      const response = await injectEnvironment(context);
      const {execution} = response;

      const mockStdout = JSON.stringify({version: '0.7.2', name: '@grnsft/if'});

      // @ts-ignore
      (execPromise as jest.Mock).mockResolvedValue({
        stdout: mockStdout,
        stderr: '',
      });

      expect.assertions(3);
      expect(execution).toHaveProperty('command');
      expect(execution?.environment).toHaveProperty('dependencies');
      expect(execution?.environment?.dependencies).toEqual([
        'release-iterator@0.7.2 (git@github.com:Green-Software-Foundation/if.git)',
      ]);

      process.env.EXECUTE = 'undefined';
    });

    it('checks if stdout do not have dependency property.', async () => {
      process.env.EXECUTE = 'invalid';
      // @ts-ignore
      const response = await injectEnvironment(context);
      const {execution} = response;

      const mockStdout = JSON.stringify({version: '0.7.2', name: '@grnsft/if'});

      // @ts-ignore
      (execPromise as jest.Mock).mockResolvedValue({
        stdout: mockStdout,
        stderr: '',
      });

      expect.assertions(3);
      expect(execution).toHaveProperty('command');
      expect(execution?.environment).toHaveProperty('dependencies');
      expect(execution?.environment?.dependencies).toEqual([]);

      process.env.EXECUTE = 'undefined';
    });

    it('checks environment response type.', async () => {
      // @ts-ignore
      const response = await injectEnvironment(context);
      const environment = response.execution!.environment!;

      expect.assertions(5);
      expect(typeof environment['date-time']).toEqual('string');
      expect(Array.isArray(environment.dependencies)).toBeTruthy();
      expect(typeof environment['node-version']).toEqual('string');
      expect(typeof environment.os).toEqual('string');
      expect(typeof environment['os-version']).toEqual('string');
    });
  });
});
