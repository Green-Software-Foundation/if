import {PluginParams, GroupByConfig} from '@grnsft/if-core/types';

import {mergeObjects} from '../util/helpers';
import {debugLogger} from '../../common/util/debug-logger';

import {STRINGS} from '../config/strings';

import {isExecute, isGroupBy} from '../types/interface';
import {ComputeParams, Node, Params} from '../types/compute';

const {MERGING_DEFAULTS_WITH_INPUT_DATA, COMPUTING_PIPELINE_FOR_NODE} = STRINGS;

/**
 * Traverses all child nodes based on children grouping.
 */
const traverse = async (children: any, params: Params) => {
  for (const child in children) {
    await computeNode(children[child], params);
  }
};

/**
 * Appends `default` values to `inputs`.
 */
const mergeDefaults = (
  inputs: PluginParams[],
  defaults: PluginParams | undefined
) => {
  if (inputs) {
    const response = defaults
      ? inputs.map(input => mergeObjects(defaults, input))
      : inputs;

    return response;
  }

  console.debug(MERGING_DEFAULTS_WITH_INPUT_DATA);

  return defaults ? [defaults] : [];
};

/**
 * 1. If the node has it's own pipeline, defaults or config then use that,
 *    otherwise use whatever has been passed down from further up the tree.
 * 2. If it's a grouping node, then first of all computes all it's children.
 *    This is doing a depth first traversal.
 * 3. Otherwise merges the defaults into the inputs.
 * 4. Goes through the pipeline plugins, by checking if it's `execute` plugin. If so sets outputs.
 *    If is a `groupby` plugin, it will return child components rather than outputs.
 * 5. Since after `groupby`, there are new child components, then computes them.
 *    Note: `pipeline` now equals the remaining plu.gins to apply to each child
 */
const computeNode = async (node: Node, params: Params): Promise<any> => {
  const pipeline = (node.pipeline || params.pipeline) as string[];
  const config = node.config || params.config;
  const defaults = node.defaults || params.defaults;

  if (node.children) {
    return traverse(node.children, {
      ...params,
      pipeline,
      defaults,
      config,
    });
  }

  let inputStorage = structuredClone(node.inputs) as PluginParams[];
  inputStorage = mergeDefaults(inputStorage, defaults);
  const pipelineCopy = structuredClone(pipeline);

  while (pipelineCopy.length !== 0) {
    const pluginName = pipelineCopy.shift() as string;
    const plugin = params.pluginStorage.get(pluginName);
    const nodeConfig = config && config[pluginName];

    console.debug(COMPUTING_PIPELINE_FOR_NODE(pluginName));
    debugLogger.setExecutingPluginName(pluginName);

    if (isExecute(plugin)) {
      inputStorage = await plugin.execute(inputStorage, nodeConfig);
      debugLogger.setExecutingPluginName();

      node.outputs = inputStorage;
    }

    if (isGroupBy(plugin)) {
      node.children = await plugin.execute(
        inputStorage,
        nodeConfig as GroupByConfig
      );
      delete node.inputs;
      delete node.outputs;

      await traverse(node.children, {
        ...params,
        pipeline: pipelineCopy,
        defaults,
        config,
      });

      debugLogger.setExecutingPluginName();

      break;
    }
  }
};

/**
 * Creates copy of existing tree, then applies computing strategy.
 */
export const compute = async (tree: any, params: ComputeParams) => {
  const copyOfTree = structuredClone(tree);

  await computeNode(copyOfTree, params);

  return copyOfTree;
};
