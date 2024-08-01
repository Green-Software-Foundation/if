import * as path from 'path';

import {getFileName, getYamlFiles} from '../../common/util/fs';
import {Context} from '../../common/types/manifest';
import {load} from '../../common/lib/load';

import {ExportYaml} from '../../if-run/builtins/export-yaml';

import {IFMergeArgs} from '../types/process-args';

/**
 * Merges the given manifests in the one file.
 */
export const mergeManifests = async (mergeArgs: IFMergeArgs) => {
  const {manifests: commandManifests, name, description} = mergeArgs;
  let manifests = commandManifests;
  let manifestPath = process.env.CURRENT_DIR || process.cwd();

  if (commandManifests.length === 1) {
    manifests = await getYamlFiles(commandManifests[0]);
    manifestPath = commandManifests[0];
  }
  const context = {
    name: name || 'if-merge',
    description: description || 'merged manifest',
    tags: null,
    initialize: {plugins: {}},
  };
  const tree = await mergeManifestsData(manifests, context);
  const outputPath = getOutputPath(name, manifestPath);

  await saveMergedManifest(tree, context, outputPath);
};

/**
 * Merges manifests data.
 */
const mergeManifestsData = async (manifests: string[], context: Context) => {
  const tree: any = {children: {}};

  for await (const manifest of manifests) {
    const manifestName = getFileName(manifest);
    const {rawManifest} = await load(manifest);

    context.tags = Object.assign({}, context.tags, rawManifest.tags);
    context.initialize.plugins = {
      ...context.initialize.plugins,
      ...rawManifest.initialize.plugins,
    };

    Object.keys(rawManifest.tree.children).forEach(child => {
      tree.children[`${child}-${manifestName}`] = {
        ...rawManifest.tree.children[child],
      };
    });
  }

  return tree;
};

/**
 * Gets output path.
 */
const getOutputPath = (name: string | undefined, manifestPath: string) => {
  const manifestName = `${(name || 'merged-manifest').replace(' ', '-')}.yaml`;

  return path.join(manifestPath, manifestName);
};

/**
 * Saves the merged manifest in the `merged-manifest.yaml` file.
 */
const saveMergedManifest = async (
  tree: any,
  context: Context,
  outputPath: string
) => {
  const exportYaml = ExportYaml();

  await exportYaml.execute(tree, context, outputPath);
};
