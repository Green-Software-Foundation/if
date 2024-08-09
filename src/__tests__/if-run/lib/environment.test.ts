/* eslint-disable @typescript-eslint/ban-ts-comment */

import {injectEnvironment} from '../../../if-run/lib/environment';

describe('lib/envirnoment: ', () => {
  describe('injectEnvironment(): ', () => {
    const context = {};

    it('checks response to have `execution` property.', async () => {
      // @ts-ignore
      const response = await injectEnvironment(context);
      expect(response).toHaveProperty('execution');
    }, 6000);

    it('checks `execution` to have `command` and `environment` props.', async () => {
      // @ts-ignore
      const response = await injectEnvironment(context);
      const {execution} = response;

      expect(execution).toHaveProperty('command');
      expect(execution).toHaveProperty('environment');
    });

    it('checks environment response type.', async () => {
      // @ts-ignore
      const response = await injectEnvironment(context);
      const environment = response.execution!.environment!;

      expect(typeof environment['date-time']).toEqual('string');
      expect(Array.isArray(environment.dependencies)).toBeTruthy();
      expect(typeof environment['node-version']).toEqual('string');
      expect(typeof environment.os).toEqual('string');
      expect(typeof environment['os-version']).toEqual('string');
    });
  });
});
