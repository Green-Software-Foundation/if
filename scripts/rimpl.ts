import {parseProcessArgument} from '../src/util/args';
import {openYamlFileAsObject, saveYamlFileAs} from '../src/util/yaml';
import {Observatory} from '../src/util/observatory';
import {ModelsUniverse} from '../src/util/models-universe';

/**
 * Flattens config entries.
 */
const flattenConfigValues = (config: any) => {
  const configModelNames = Object.keys(config);
  const values = configModelNames.reduce((acc: any, name: string) => {
    acc = {
      ...acc,
      ...config[name],
    };

    return acc;
  }, {});

  return values;
};

/**
 * For each graph builds params, then passes it to computing fn.
 */
const calculateImpactsBasedOnGraph =
  (impl: any, modelsHandbook: ModelsUniverse) =>
  async (childrenName: string) => {
    const child = impl.graph.children[childrenName];
    const {pipeline, observations, config} = child;

    const extendedObservations = observations.map((observation: any) => ({
      ...observation,
      ...flattenConfigValues,
    }));

    const observatory = new Observatory(extendedObservations);

    for (const modelName of pipeline) {
      const modelInstance: any = await modelsHandbook.initalizedModels[
        modelName
      ](config && config[modelName]);

      await observatory.doInvestigationsWith(modelInstance);
    }

    const impacts = observatory.getImpacts();
    impl.graph.children[childrenName].impacts = impacts;

    return impl;
  };

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
