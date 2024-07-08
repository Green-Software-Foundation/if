/* eslint-disable no-restricted-properties */
jest.mock('os', () => ({
  platform: () => {
    if (process.env.KIND === 'darwin') return 'darwin';
    if (process.env.KIND === 'linux') return 'linux';
    if (process.env.KIND === 'win32') return 'win32';

    return 'sunos';
  },
  release: () => 'm.m.m',
}));
jest.mock('../../../common/util/helpers', () => ({
  execPromise: async () => {
    if (process.env.KIND === 'darwin' && process.env.REJECT === 'true')
      return {
        stdout: '',
      };
    if (process.env.KIND === 'linux' && process.env.REJECT === 'true') {
      return {
        stdout: '',
      };
    }
    if (process.env.KIND === 'win32' && process.env.REJECT === 'true')
      return {
        stdout: '',
      };
    if (process.env.KIND === 'darwin') {
      return {
        stdout: `
ProductName:      macOS
ProductVersion:   14.3.1
BuildVersion:     23D60      
      `,
      };
    }

    if (process.env.KIND === 'linux') {
      return {
        stdout: `
Distributor ID: Ubuntu
Description:    Ubuntu 22.04.4 LTS
Release:        22.04
Codename:       jammy
      `,
      };
    }

    if (process.env.KIND === 'win32') {
      return {
        stdout: `
OS Name:                   Microsoft Windows 11 Enterprise
OS Version:                10.0.22631 N/A Build 22631
      `,
      };
    }

    return '';
  },
}));

import {osInfo} from '../../../if-run/util/os-checker';

describe('util/os-checker: ', () => {
  describe('osInfo(): ', () => {
    it('returns object with `os` and `os-version` properties.', async () => {
      const response = await osInfo();
      expect.assertions(2);

      expect(response).toHaveProperty('os');
      expect(response).toHaveProperty('os-version');
    });

    it('returns mac os information.', async () => {
      process.env.KIND = 'darwin';
      expect.assertions(1);

      const expectedResponse = {
        os: 'macOS',
        'os-version': '14.3.1',
      };
      const response = await osInfo();
      expect(response).toEqual(expectedResponse);
    });

    it('returns windows information.', async () => {
      process.env.KIND = 'win32';
      expect.assertions(1);

      const expectedResponse = {
        os: 'Microsoft Windows 11 Enterprise',
        'os-version': '10.0.22631 N/A Build 22631',
      };
      const response = await osInfo();
      expect(response).toEqual(expectedResponse);
    });

    it('returns linux information.', async () => {
      process.env.KIND = 'linux';
      expect.assertions(1);

      const expectedResponse = {
        os: 'Ubuntu',
        'os-version': '22.04.4 LTS',
      };
      const response = await osInfo();
      expect(response).toEqual(expectedResponse);
    });

    it('returns default information.', async () => {
      process.env.KIND = 'other';
      expect.assertions(2);

      const response = await osInfo();
      expect(typeof response.os).toEqual('string');
      expect(typeof response['os-version']).toEqual('string');
    });

    it('returns info from node os on linux.', async () => {
      process.env.KIND = 'linux';
      process.env.REJECT = 'true';

      const response = await osInfo();
      const expectedOS = 'linux';
      const expectedOSVersion = 'm.m.m';
      expect(response.os).toEqual(expectedOS);
      expect(response['os-version']).toEqual(expectedOSVersion);
    });

    it('returns info from node os on darwin.', async () => {
      process.env.KIND = 'darwin';
      process.env.REJECT = 'true';

      const response = await osInfo();
      const expectedOS = 'darwin';
      const expectedOSVersion = 'm.m.m';
      expect(response.os).toEqual(expectedOS);
      expect(response['os-version']).toEqual(expectedOSVersion);
    });

    it('returns info from node os on win32.', async () => {
      process.env.KIND = 'win32';
      process.env.REJECT = 'true';

      const response = await osInfo();
      const expectedOS = 'win32';
      const expectedOSVersion = 'm.m.m';
      expect(response.os).toEqual(expectedOS);
      expect(response['os-version']).toEqual(expectedOSVersion);
    });
  });
});
