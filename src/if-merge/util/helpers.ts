import * as path from 'path';

import {getFileName, getYamlFiles} from '../../common/util/fs';
import {Context} from '../../common/types/manifest';
import {load} from '../../common/lib/load';

import {exhaust} from '../../if-run/lib/exhaust';
import {IFMergeArgs} from '../types/process-args';

/**
 * Merges the given manifests in the one file.
 */
export const mergeManifests = async (mergeArgs: IFMergeArgs) => {
  const {manifests: commandManifests, output, name, description} = mergeArgs;
  let manifests = commandManifests;

  if (commandManifests.length === 1) {
    manifests = await getYamlFiles(commandManifests[0]);
  }
  const context = {
    name: name || 'if-merge',
    description: description || 'merged manifest',
    tags: null,
    initialize: {plugins: {}},
  };
  const tree = await mergeManifestsData(manifests, context);

  await saveMergedManifest(tree, context, output);
};

/**
 * Merges manifests data.
 */
const mergeManifestsData = async (manifests: string[], context: Context) => {
  const tree: any = {children: {}};

  for await (const manifest of manifests) {
    const manifestName = getFileName(manifest);
    const {rawManifest} = await load(manifest);
    const parentDir = path.basename(path.dirname(manifest));
    const uniqueName = `${parentDir}-${manifestName}`;

    context.tags = Object.assign({}, context.tags, rawManifest.tags);
    context.initialize.plugins = {
      ...context.initialize.plugins,
      ...rawManifest.initialize.plugins,
    };

    Object.keys(rawManifest.tree.children).forEach(child => {
      tree.children[`${child}-${uniqueName}`] = {
        ...rawManifest.tree.children[child],
      };
    });
  }

  return tree;
};

/**
 * Saves the merged manifest in the `merged-manifest.yaml` file.
 */
const saveMergedManifest = async (
  tree: any,
  context: Context,
  outputPath: string | undefined
) => {
  const output = {
    outputPath,
    noOutput: false,
  };
  await exhaust(tree, context, output);
};
