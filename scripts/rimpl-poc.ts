import {parseProcessArgument} from '../src/util/args';
import {openYamlFileAsObject} from '../src/util/yaml';

/**
 * 1. Parses process argument.
 * 2. Opens yaml file as an object.
 * @todo Apply logic here.
 * @example `npx ts-node scripts/rimpl-poc/ts ./test.yml`
 */
const rimplPOCScript = async () => {
  try {
    const yamlPath = parseProcessArgument();
    const impl = await openYamlFileAsObject(yamlPath);

    const servers = impl.graph.backend.children.servers?.observations;

    console.log(`Check object here: ${servers}`);
  } catch (error) {
    console.error(error);
  }
};

rimplPOCScript();
