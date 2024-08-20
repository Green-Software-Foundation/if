import {PluginParams} from '@grnsft/if-core/types';

import {Regroup} from './regroup';
import {addExplainData} from './explain';

import {debugLogger} from '../../common/util/debug-logger';
import {logger} from '../../common/util/logger';

import {mergeObjects} from '../util/helpers';

import {STRINGS} from '../config/strings';

import {ComputeParams, Node, PhasedPipeline} from '../types/compute';
import {isExecute} from '../types/interface';

const {
  MERGING_DEFAULTS_WITH_INPUT_DATA,
  EMPTY_PIPELINE,
  CONFIG_WARN,
  COMPUTING_PIPELINE_FOR_NODE,
  COMPUTING_COMPONENT_PIPELINE,
  REGROUPING,
  OBSERVING,
} = STRINGS;

/**
 * Traverses all child nodes based on children grouping.
 */
const traverse = async (children: any, params: ComputeParams) => {
  for (const child in children) {
    console.debug(COMPUTING_COMPONENT_PIPELINE(child));
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

  console.debug(MERGING_DEFAULTS_WITH_INPUT_DATA, '\n');

  return defaults ? [defaults] : [];
};

/**
 * 1. If the node has it's own pipeline, defaults or config then use that,
 *    otherwise use whatever has been passed down from further up the tree.
 * 2. If it's a grouping node, then first of all computes all it's children.
 *    This is doing a depth first traversal.
 * 3. Otherwise merges the defaults into the inputs.
 * 4. Iterates over pipeline phases (observe, regroup, compute).
 * 5. Observe plugins are used to insert input values
 *    (isolated execution can be achived by passing `--observe` flag to CLI command).
 * 6. Regroup plugin is used to group existing inputs by criteria
 *    (isolated execution can be achived by passing `--regroup` flag to CLI command).
 *    Since it creates new children for node, existing inputs and outputs are dropped and recursive traversal is called
 *    for newbord child component.
 * 7. Compute plugins are used to do desired computations and appending the result to outputs
 *    (isolated execution can be achived by passing `--compute` flag to CLI command).
 */
const computeNode = async (node: Node, params: ComputeParams): Promise<any> => {
  const pipeline = node.pipeline || (params.pipeline as PhasedPipeline);
  const config = node.config || params.config;
  const defaults = node.defaults || params.defaults;
  const noFlags = !params.observe && !params.regroup && !params.compute;

  debugLogger.setExecutingPluginName();
  warnIfConfigProvided(node);

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
  const pipelineCopy = structuredClone(pipeline) || {};

  /** Checks if pipeline is not an array or empty object. */
  if (
    Array.isArray(pipelineCopy) ||
    (typeof pipelineCopy === 'object' &&
      pipelineCopy !== null &&
      Object.keys(pipelineCopy).length === 0)
  ) {
    logger.warn(EMPTY_PIPELINE);
  }

  /**
   * If iteration is on observe pipeline, then executes observe plugins and sets the inputs value.
   */
  if ((noFlags || params.observe) && pipelineCopy.observe) {
    while (pipelineCopy.observe.length !== 0) {
      const pluginName = pipelineCopy.observe.shift() as string;
      console.debug(OBSERVING(pluginName));
      debugLogger.setExecutingPluginName(pluginName);

      const plugin = params.pluginStorage.get(pluginName);
      const nodeConfig = config && config[pluginName];

      if (isExecute(plugin)) {
        inputStorage = await plugin.execute(inputStorage, nodeConfig);
        node.inputs = inputStorage;

        if (params.context.explainer) {
          addExplainData({
            pluginName,
            metadata: plugin.metadata,
            pluginData: params.context.initialize!.plugins[pluginName],
          });
        }
      }
    }
  }

  /**
   * If regroup is requested, execute regroup strategy, delete child's inputs, outputs and empty regroup array.
   */
  if ((noFlags || params.regroup) && pipelineCopy.regroup) {
    const originalOutputs = params.append ? node.outputs || [] : [];

    node.children = Regroup(
      inputStorage,
      originalOutputs,
      pipelineCopy.regroup
    );

    delete node.inputs;
    delete node.outputs;

    debugLogger.setExecutingPluginName();
    console.debug(REGROUPING);

    return traverse(node.children, {
      ...params,
      pipeline: {
        ...pipelineCopy,
        regroup: undefined,
      },
      defaults,
      config,
    });
  }

  console.debug('\n');

  /**
   * If iteration is on compute plugin, then executes compute plugins and sets the outputs value.
   */
  if ((noFlags || params.compute) && pipelineCopy.compute) {
    const originalOutputs = params.append ? node.outputs || [] : [];
    while (pipelineCopy.compute.length !== 0) {
      const pluginName = pipelineCopy.compute.shift() as string;
      const plugin = params.pluginStorage.get(pluginName);
      const nodeConfig = config && config[pluginName];

      console.debug(COMPUTING_PIPELINE_FOR_NODE(pluginName));
      debugLogger.setExecutingPluginName(pluginName);

      if (isExecute(plugin)) {
        inputStorage = await plugin.execute(inputStorage, nodeConfig);
        debugLogger.setExecutingPluginName();

        node.outputs = inputStorage;

        if (params.context.explainer) {
          addExplainData({
            pluginName,
            metadata: plugin.metadata,
            pluginData: params.context.initialize!.plugins[pluginName],
          });
        }
      }
    }

    if (params.append) {
      node.outputs = originalOutputs.concat(node.outputs || []);
    }
  }
  console.debug('\n');
};

/**
 * Warns if the `config` is provided in the manifest.
 */
const warnIfConfigProvided = (node: any) => {
  if ('config' in node) {
    const plugins = Object.keys(node.config || {});
    const joinedPlugins = plugins.join(', ');
    const isMore = plugins.length > 1;

    logger.warn(CONFIG_WARN(joinedPlugins, isMore));
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
