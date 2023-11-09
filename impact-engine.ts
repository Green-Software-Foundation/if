import {parseProcessArgument} from './src/util/args';
import {ModelsUniverse} from './src/util/models-universe';
import {Supercomputer} from './src/util/supercomputer';
import {openYamlFileAsObject, saveYamlFileAs} from './src/util/yaml';
import {validateImpl} from './src/util/validations';

/**
 * 1. Parses yml input/output process arguments.
 * 2. Opens yaml file as an object.
 * 3. Initializes models.
 * 4. Initializes graph, does computing.
 * 5. Saves processed object as a yaml file.
 * @example run following command `npx ts-node scripts/impact.ts --impl ./test.yml --ompl ./result.yml`
 */
const impactEngine = async () => {
  const processParams = parseProcessArgument();

  if (processParams) {
    const {inputPath, outputPath} = processParams;
    const rawImpl = await openYamlFileAsObject(inputPath);

    // Lifecycle Validation
    const impl = validateImpl(rawImpl);

    // Lifecycle Initialize Models
    const modelsHandbook = new ModelsUniverse();
    impl.initialize.models.forEach((model: any) =>
      modelsHandbook.writeDown(model)
    );

    // Lifecycle Computing
    const ateruiComputer = new Supercomputer(impl, modelsHandbook);
    const ompl = await ateruiComputer.compute();

    if (!outputPath) {
      console.log(JSON.stringify(ompl));
      return;
    }

    await saveYamlFileAs(ompl, outputPath);

    return;
  }

  return Promise.reject(new Error('missing params'));
};

impactEngine().catch(error => console.error(`\n ${error}`));
