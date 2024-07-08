import * as YAML from 'js-yaml';

import {Context} from '../../common/types/manifest';

export const ExportLog = () => {
  /**
   * Logs output manifest in console.
   */
  const execute = async (tree: any, context: Context) => {
    const outputFile = {
      ...context,
      tree,
    };

    console.log(`# start
${YAML.dump(outputFile, {noRefs: true})}
# end`);
  };

  return {execute};
};
