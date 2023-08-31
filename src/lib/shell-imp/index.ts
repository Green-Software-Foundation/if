import { IImpactModelInterface } from '../interfaces';
import { KeyValuePair } from '../../types/boavizta';


export class ShellModel implements IImpactModelInterface {
  // Defined for compatibility. Not used in TEADS.
  authParams: object | undefined;
  // name of the data source
  name: string | undefined;

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
    return this;
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
  private runModelInShell(observations, execPath, omplName) {
    try {
      const result = cp.spawnSync(execPath, ['--calculate', '--impl=' + observations]).stdout.toString();
      const yamlData = yaml.dump(yaml.load(result))
      fs.writeFileSync(omplName, yamlData, 'utf8');
      return yamlData
    } catch (e) {
      console.error(e)
    }
  }

  async calculate(
    observations: object | object[] | undefined
  ): Promise<object> {
    if (observations === undefined) {
      throw new Error('Required Parameters not provided');
    }

    // TODO: NEED TO CONVERT OBSERVATIONS TO YAML STRING HERE

    const resultsYaml = this.runModelInShell(observations, "/usr/bin/pimpl.py", "ompl.yaml")

    // TODO: NEED TO PARSE YAML RETURNED FROM MODEL TO RESULTS OBJECT
    // TODO: RETURN THE RESULTS OBJECT

    //return results;
  }



  /**
   * Returns model identifier
   */
  modelIdentifier(): string {
    return 'shellModel';
  }
}
