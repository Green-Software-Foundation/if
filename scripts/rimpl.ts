import {parseProcessArgument} from '../src/util/args';
import {ModelsUniverse} from '../src/util/models-universe';
import {calculateImpactsBasedOnGraph} from '../src/util/rimpl-helpers';
import {openYamlFileAsObject, saveYamlFileAs} from '../src/util/yaml';

/**
 * 1. Parses yml input/output process arguments.
 * 2. Opens yaml file as an object.
 * 3. Initializes models.
 * 4. Initializes graph, does computing.
 * 5. Saves processed object as a yaml file.
 * @example run following command `npx ts-node scripts/rimpl.ts --impl ./test.yml --ompl ./result.yml`
 */
const rimplScript = async () => {
  try {
    const {inputPath, outputPath} = parseProcessArgument();
    const impl = await openYamlFileAsObject(inputPath);

    if (!('graph' in impl)) {
      throw new Error('No graph data found.');
    }

    // Lifecycle Initialize Models
    const modelsHandbook = new ModelsUniverse();

    impl.initialize.models.forEach((model: any) =>
      modelsHandbook.writeDown(model)
    );

    // Initialize impact graph/computing
    const childrenNames = Object.keys(impl.graph.children);

    await Promise.all(
      childrenNames.map(calculateImpactsBasedOnGraph(impl, modelsHandbook))
    );

    if (!outputPath) {
      console.log(JSON.stringify(impl));
      return;
    }

    saveYamlFileAs(impl, outputPath);
  } catch (error) {
    console.error(error);
  }
};

rimplScript();
