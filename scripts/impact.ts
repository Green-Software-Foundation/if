import { parseProcessArgument } from '../src/util/args';
import { ModelsUniverse } from '../src/util/models-universe';
import { Supercomputer } from '../src/util/supercomputer';
import { openYamlFileAsObject, saveYamlFileAs } from '../src/util/yaml';

/**
 * 1. Parses yml input/output process arguments.
 * 2. Opens yaml file as an object.
 * 3. Initializes models.
 * 4. Initializes graph, does computing.
 * 5. Saves processed object as a yaml file.
 * @example run following command `npx ts-node scripts/impact.ts --impl ./test.yml --ompl ./result.yml`
 */
const impactScript = async () => {
  try {
    const processParams = parseProcessArgument();

    if (processParams) {
      const { inputPath, outputPath } = processParams;
      const impl = await openYamlFileAsObject(inputPath);

      if (!('graph' in impl)) {
        throw new Error('No graph data found.');
      }

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
    }
  } catch (error) {
    console.error(error);
  }
};

impactScript();
