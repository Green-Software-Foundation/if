import {parseProcessArgument} from '../src/util/args';
import {openYamlFileAsObject} from '../src/util/yaml';

/**
 * 1. Parses process argument.
 * 2. Opens yaml file as an object.
 * @todo Apply logic here.
 * @example run following command `npx ts-node scripts/rimpl-poc/ts ./test.yml`
 */
const rimplPOCScript = async () => {
  try {
    const yamlPath = parseProcessArgument();
    const impl = await openYamlFileAsObject(yamlPath);

    console.log(`Check object here: ${impl}`);
  } catch (error) {
    console.error(error);
  }
};

rimplPOCScript();
