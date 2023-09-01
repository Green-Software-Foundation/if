import {parseProcessArgument} from '../src/util/args';
import {openYamlFileAsObject, saveYamlFileAs} from '../src/util/yaml';

import {ObservationPipeline} from '../src/util/observation-pipeline';
import {KeyValuePair} from '../src';

/**
 * Computes impact based on given `observations` and `params`.
 */
const computeImpact = async (observations: any[], params: any) => {
  const observatory = new ObservationPipeline(observations);
  const computation = await observatory.pipe('boavizta', params);

  return computation.getObservationsData();
};

/**
 * For each graph builds params, then passes it to computing fn.
 */
const calculateImpactsBasedOnGraph = (graphs: any) => (title: string) => {
  const serviceData = graphs[title];
  const {observations} = serviceData;

  const params: KeyValuePair = {
    allocation: 'TOTAL',
    verbose: true,
    name: observations[0].processor,
    core_units: 24,
  };

  return computeImpact(observations, params).then(result => {
    graphs[title].observations = result;

    return graphs;
  });
};

/**
 * 1. Parses yml input/output process arguments.
 * 2. Opens yaml file as an object.
 * 3. Saves processed object as an yaml file.
 * @todo Apply logic here.
 * @example run following command `npx ts-node scripts/rimpl-poc.ts --impl ./test.yml --ompl ./result.yml`
 */
const rimplPOCScript = async () => {
  try {
    const {inputPath, outputPath} = parseProcessArgument();
    const impl = await openYamlFileAsObject(inputPath);

    if (!('graph' in impl)) {
      throw new Error('No graph data found.');
    }

    const graphs = impl.graph;

    // calculate for single graph
    const serviceTitles = Object.keys(graphs).splice(0);

    const graphsUpdated = await Promise.all(
      serviceTitles.map(calculateImpactsBasedOnGraph(graphs))
    );

    impl.graph = graphsUpdated[0];

    console.log(impl.graph);

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
