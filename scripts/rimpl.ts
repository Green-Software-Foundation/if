import {parseProcessArgument} from '../src/util/args';
import {openYamlFileAsObject, saveYamlFileAs} from '../src/util/yaml';
import {Observatory} from '../src/util/observatory';
import {ModelsUniverse} from '../src/util/models-universe';

/**
 * For each graph builds params, then passes it to computing fn.
 */
const calculateImpactsBasedOnGraph =
  (impl: any, modelsHandbook: ModelsUniverse) => async (service: string) => {
    const serviceData = impl.graph.children[service];
    const {pipeline, observations, config} = serviceData;

    const observatory = new Observatory(observations);

    for (const model of pipeline) {
      const instance: any = await modelsHandbook.initalizedModels[model](
        config[model]
      );

      await observatory.doInvestigationsWith(instance);
    }

    const impact = observatory.getObservedImpact();
    impl.graph.children[service].impact = impact;

    return impl;
  };

/**
 * 1. Parses yml input/output process arguments.
 * 2. Opens yaml file as an object.
 * 3. Initializes models.
 * 4. Initializes graph, does computing.
 * 5. Saves processed object as a yaml file.
 * @todo Apply logic here.
 * @example run following command `npx ts-node scripts/rimpl.ts --impl ./test.yml --ompl ./result.yml`
 */
const rimplPOCScript = async () => {
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
    const services = Object.keys(impl.graph.children);

    await Promise.all(
      services.map(calculateImpactsBasedOnGraph(impl, modelsHandbook))
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

rimplPOCScript();
