import type {IfApiOptions} from '../../../if-api/types/process-args';
import {STRINGS} from '../../../if-api/config';

const {INVALID_PORT_NUMBER} = STRINGS;

describe('if-api/util/args: ', () => {
  describe('parseIfApiProcessArgs(): ', () => {
    const argv = process.argv;

    afterEach(() => {
      process.argv = argv;
      delete process.env.HOST;
      delete process.env.PORT;
    });

    it('Default values', () => {
      process.argv = [...process.argv.slice(0, 2)];
      jest.isolateModules(() => {
        const {parseIfApiProcessArgs} = require('../../../if-api/util/args');
        const response = parseIfApiProcessArgs();
        const expectedResult: IfApiOptions = {
          debug: false,
          disableExternalPluginWarning: false,
          disabledPlugins: undefined,
          port: 3000,
          host: 'localhost',
        };

        expect(response).toEqual(expectedResult);
        expect.assertions(1);
      });
    });

    it('Environment variable HOST', () => {
      process.argv = [...process.argv.slice(0, 2)];
      process.env.HOST = '0.0.0.0';
      jest.isolateModules(() => {
        const {parseIfApiProcessArgs} = require('../../../if-api/util/args');
        const response = parseIfApiProcessArgs();
        const expectedResult: IfApiOptions = {
          debug: false,
          disableExternalPluginWarning: false,
          disabledPlugins: undefined,
          port: 3000,
          host: '0.0.0.0',
        };

        expect(response).toEqual(expectedResult);
        expect.assertions(1);
      });
    });

    it('Environment variable HOST and command line option host', () => {
      process.argv = [...process.argv.slice(0, 2), '--host', 'myhost'];
      process.env.HOST = '0.0.0.0';
      jest.isolateModules(() => {
        const {parseIfApiProcessArgs} = require('../../../if-api/util/args');
        const response = parseIfApiProcessArgs();
        const expectedResult: IfApiOptions = {
          debug: false,
          disableExternalPluginWarning: false,
          disabledPlugins: undefined,
          port: 3000,
          host: 'myhost',
        };

        expect(response).toEqual(expectedResult);
        expect.assertions(1);
        expect.assertions(1);
      });
    });

    it('Environment variable PORT', () => {
      process.argv = [...process.argv.slice(0, 2)];
      process.env.PORT = '8888';
      jest.isolateModules(() => {
        const {parseIfApiProcessArgs} = require('../../../if-api/util/args');
        const response = parseIfApiProcessArgs();
        const expectedResult: IfApiOptions = {
          debug: false,
          disableExternalPluginWarning: false,
          disabledPlugins: undefined,
          port: 8888,
          host: 'localhost',
        };

        expect(response).toEqual(expectedResult);
        expect.assertions(1);
      });
    });

    it('Environment variable PORT and command line option port', () => {
      process.argv = [...process.argv.slice(0, 2), '--port', '3333'];
      process.env.PORT = '8888';
      jest.isolateModules(() => {
        const {parseIfApiProcessArgs} = require('../../../if-api/util/args');
        const response = parseIfApiProcessArgs();
        const expectedResult: IfApiOptions = {
          debug: false,
          disableExternalPluginWarning: false,
          disabledPlugins: undefined,
          port: 3333,
          host: 'localhost',
        };

        expect(response).toEqual(expectedResult);
        expect.assertions(1);
      });
    });

    it('String specified for port', () => {
      process.argv = [...process.argv.slice(0, 2), '--port', 'abc'];
      jest.isolateModules(() => {
        const {parseIfApiProcessArgs} = require('../../../if-api/util/args');
        expect(() => parseIfApiProcessArgs()).toThrow(
          INVALID_PORT_NUMBER('abc')
        );
        expect.assertions(1);
      });
    });

    it('Negative number for port', () => {
      process.argv = [...process.argv.slice(0, 2), '--port', '-1'];
      jest.isolateModules(() => {
        const {parseIfApiProcessArgs} = require('../../../if-api/util/args');
        expect(() => parseIfApiProcessArgs()).toThrow(
          INVALID_PORT_NUMBER('-1')
        );
        expect.assertions(1);
      });
    });

    it('65536 for port', () => {
      process.argv = [...process.argv.slice(0, 2), '--port', '65536'];
      jest.isolateModules(() => {
        const {parseIfApiProcessArgs} = require('../../../if-api/util/args');
        expect(() => parseIfApiProcessArgs()).toThrow(
          INVALID_PORT_NUMBER('65536')
        );
        expect.assertions(1);
      });
    });

    it('Non-existent option', () => {
      process.argv = [...process.argv.slice(0, 2), '-z'];
      jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
        expect(code).toEqual(1);
        throw new Error(`process.exit(${code}) called`);
      });
      jest.isolateModules(() => {
        const {parseIfApiProcessArgs} = require('../../../if-api/util/args');
        expect(() => parseIfApiProcessArgs()).toThrow('process.exit(1) called');
        expect.assertions(2);
      });
    });
  });
});
