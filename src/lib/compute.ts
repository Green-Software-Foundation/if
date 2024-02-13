import {Node, Params} from '../types/compute';
import {PluginsStorage} from '../types/initialize';
import {PluginParams} from '../types/interface';
import {ManifestCommon} from '../types/manifest';

/**
 * Creates copy of existing tree, then applies computing strategy.
 */
export const compute = async (
  tree: any,
  context: ManifestCommon,
  plugins: PluginsStorage
) => {
  const treeCopy = structuredClone(tree);
  await computeNode(treeCopy, {
    plugins,
    context,
  });

  return treeCopy;
};

/**
 * Traverses all child nodes based on children grouping.
 */
const carousel = async (children: any, params: Params) => {
  for (const child in children) {
    await computeNode(children[child], params);
  }
};

/**
 * 1. If the node has it's own pipeline, defaults or config then use that,
 *    otherwise use whatever has been passed down from further up the tree
 * @todo update this doc
 */
const computeNode = async (node: Node, params: Params): Promise<any> => {
  const pipeline = node.pipeline ?? params.pipeline;
  const config = node.config || params.pipeline;
  const defaults = node.defaults || params.defaults;

  if (node.children) {
    return carousel(node.children, {
      pipeline,
      defaults,
      config,
      ...params,
    });
  }

  let storage: PluginParams[] = node.inputs!;

  while (pipeline?.length !== 0) {
    const pluginName = pipeline!.shift();

    if (pluginName) {
      const plugin = params.plugins[pluginName];
      const enrichedInputs = node.inputs!.map(input => ({
        ...input,
        ...defaults,
      }));
      const {execute, metadata} = plugin;

      if (metadata.kind === 'execute') {
        storage = await execute(enrichedInputs, config);
      }

      if (metadata.kind === 'groupby') {
        node.children = await execute(enrichedInputs, config);

        await carousel(node.children, {
          pipeline,
          defaults,
          config,
          ...params,
        });
      }
    }
  }

  node.outputs = storage;
  return;
};
