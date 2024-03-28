import {PluginParams} from '../../../../types/interface';

/**
 * Mock model for testing.
 * Be sure when using this mock to specify that it's virtual.
 * @example
 * jest.mock(
 *   'mockavizta',
 *   Mockavizta,
 *   {virtual: true}
 * );
 */
export const Mockavizta = () => ({
  execute: (input: PluginParams) => input,
  metadata: {
    kind: 'execute',
  },
});
