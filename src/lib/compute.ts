import {mergeObjects} from '../util/helpers';

import {ComputeParams, Node, Params} from '../types/compute';
import {PluginParams} from '../types/interface';

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
      ? inputs.map(input => mergeObjects(input, defaults))
      : inputs;

    return response;
  }

  return [];
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

  let storage = node.inputs as PluginParams[];
  const pipelineCopy = structuredClone(pipeline);

  while (pipelineCopy.length !== 0) {
    const pluginName = pipelineCopy.shift() as string;
    storage = mergeDefaults(storage, defaults);

    const plugin = params.plugins[pluginName];
    const {execute, metadata} = plugin;
    const nodeConfig = config && config[pluginName];

    if (metadata.kind === 'execute') {
      storage = await execute(storage, nodeConfig);
      node.outputs = storage;
    }

    if (metadata.kind === 'groupby') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      node.children = await execute(storage, nodeConfig);
      delete node.inputs;
      delete node.outputs;

      await traverse(node.children, {
        ...params,
        pipeline: pipelineCopy,
        defaults,
        config,
      });
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
