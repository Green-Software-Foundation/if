import { IImpactModelInterface } from '../interfaces';
import * as cp from 'child_process';
import { KeyValuePair } from '../../types/boavizta';
import * as yaml from 'js-yaml';

export class ShellModel implements IImpactModelInterface {
  // Defined for compatibility. Not used in TEADS.
  authParams: object | undefined;
  // name of the data source
  name: string | undefined;
  staticParams: object | undefined;

  /**
   * Defined for compatibility. Not used in TEADS.
   */
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   *  Configures the TEADS Plugin for IEF
   *  @param {string} name name of the resource
   *  @param {Object} staticParams static parameters for the resource
   *  @param {number} staticParams.tdp Thermal Design Power in Watts
   */
  async configure(
    name: string,
    staticParams: object | undefined = undefined
  ): Promise<IImpactModelInterface> {
    this.name = name;
    this.staticParams = staticParams;
    return this;
  }

  async calculate(
    observations: object | object[] | undefined
  ): Promise<object[]> {
    if (observations === undefined) {
      throw new Error('Required Parameters not provided');
    }

    const input: KeyValuePair = {};
    input['observations'] = observations;
    if (this.staticParams !== undefined) {
      input['config'] = this.staticParams;
    }

    const inputAsString = yaml.dump(input);

    const results = this.runModelInShell(inputAsString, '/usr/bin/pimpl');

    return results['impacts'];
  }

  /**
   * Returns model identifier
   */
  modelIdentifier(): string {
    return 'shellModel';
  }

  /*
  description:
    spawns a child process to run an external IMP
    expects execPath to be a path to an executable with a CLI exposing two methods: --calculate and --impl
    The shell command then calls the --command method passing var impl as the path to the desired impl file

  params:
  - impl: yaml string (impl minus top level config)
  - execPath: (string) path to executable
  - omplName: (string) savename for ompl file

  returns:
  - ompl data to stdout
  - ompl data to disk as omplName.yaml
*/
  /**
   * Runs the model in a shell
   * @param input
   * @param execPath
   * @param omplName
   * @private
   */
  private runModelInShell(input: object[], execPath: string) {
    try {
      const result = cp
        .spawnSync(execPath, ['--calculate', '--impl=' + input])
        .stdout.toString();
      return yaml.load(result);
    } catch (e) {
      console.error(e);
    }
  }
}
