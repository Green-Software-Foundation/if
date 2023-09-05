import {parseProcessArgument} from '../src/util/args';
import {openYamlFileAsObject, saveYamlFileAs} from '../src/util/yaml';

import {Observatory} from '../src/util/observatory';
import {KeyValuePair} from '../src';

/**
 * Computes impact based on given `observations` and `params`.
 */
const runPipelineComputer = async (
  observations: any[],
  params: any,
  pipeline: string[]
) => {
  const observatory = new Observatory(observations);

  for (const model of pipeline) {
    // better to init model instance here, and pass to observatory
    await observatory.doInvestigationsWith(model, params);
  }

  return observatory.getObservedImpact();
};

/**
 * For each graph builds params, then passes it to computing fn.
 */
const calculateImpactsBasedOnGraph =
  (graphs: any) => async (service: string) => {
    const serviceData = graphs[service];
    const {observations, pipeline} = serviceData;

    /**
     * Building params should be optimized to support any model.
     * Mock params for boavizta model.
     */
    const params: KeyValuePair = {
      allocation: 'TOTAL',
      verbose: true,
      name: observations[0].processor,
      core_units: 24,
    };

    const impact = await runPipelineComputer(observations, params, pipeline);

    graphs[service].impact = impact;

    return graphs[service];
  };

/**
 * 1. Parses yml input/output process arguments.
 * 2. Opens yaml file as an object.
 * 3. Saves processed object as an yaml file.
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

    const graph = impl.graph;

    // calculate for single graph
    const services = Object.keys(graph);

    const graphsWithImpacts = await Promise.all(
      services.map(calculateImpactsBasedOnGraph(graph))
    );

    console.log(graphsWithImpacts);

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
