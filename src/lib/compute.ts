import {Node, Params} from '../types/compute';
import {PluginsStorage} from '../types/initialize';
import {ManifestCommon} from '../types/manifest';

/**
 * 1. If the node has it's own pipeline, defaults or config then use that,
 *    otherwise use whatever has been passed down from further up the tree
 * @todo update this doc
 */
const computeNode = async (node: Node, params: Params): Promise<any> => {
  const pipeline = node.pipeline ?? params.pipeline;
  const config = node.config || params.pipeline;
  const defaults = node.defaults || params.defaults;

  // If it's a grouping node, compute all it's children.
  if (node.children) {
    for (const child in node.children) {
      // The child *might* have it's own pipeline, defaults or config,
      // but we pass the parents down just in case it doesn't, in that case it will use the parents.
      return computeNode(node.children[child], {
        pipeline,
        defaults,
        config,
        ...params,
      });
    }
  } else {
    // You are a component node, merge the defaults into the inputs
    const enrichedInputs = node.inputs!.map(input => ({...input, ...defaults}));

    // `inputs` should now have had all the plugins applied and is the `outputs`
    // Go through the plugins top to bottom
    while (pipeline?.length !== 0) {
      const pluginName = pipeline!.shift();

      if (pluginName) {
        const plugin = params.plugins[pluginName];

        // We need some meta data about the plugin so we know what function to call.
        if (plugin.metadata.kind === 'execute') {
          // This is a normal execute plugin, will return outputs
          const result = await plugin.execute(enrichedInputs, config);
          node.inputs = result;
          // `inputs` now equals the outputs of the last plugin
        } else if (plugin.metadata.kind === 'groupby') {
          node.children = plugin.execute(enrichedInputs, config);

          for (const child in node.children) {
            // `pipeline` now equals the remaining plugins to apply to each child
            return computeNode(node.children[child], {
              pipeline,
              defaults,
              config,
              ...params,
            });
          }
          // get out of the while loop, we don't want to process any more plugins we are a grouping node now
          break;
        }
      }
    }
    // `inputs` should now have had all the plugins applied and is the `outputs`
    node.outputs = node.inputs;
    return;
  }
};

/**
 * Creates copy of existing tree, then applies computing strategy.
 */
export const compute = async (
  tree: any,
  context: ManifestCommon,
  plugins: PluginsStorage
) => {
  const treeCopy = JSON.parse(JSON.stringify(tree));
  await computeNode(treeCopy, {
    plugins,
    context,
  });

  return treeCopy;
};
