import {parseProcessArgument} from '../src/util/args';
import {openYamlFileAsObject, saveYamlFileAs} from '../src/util/yaml';

/**
 * 1. Parses process argument.
 * 2. Opens yaml file as an object.
 * @todo Apply logic here.
 * @example run following command `npx ts-node scripts/rimpl-poc.ts --impl ./test.yml --ompl ./result.yml`
 */
const rimplPOCScript = async () => {
  try {
    const {inputPath, outputPath} = parseProcessArgument();

    const impl = await openYamlFileAsObject(inputPath);

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
