import * as path from 'path';

import {getFileName, getYamlFiles} from '../../common/util/fs';
import {load} from '../../common/lib/load';
import {Context} from '../../common/types/manifest';

import {ExportYaml} from '../../if-run/builtins/export-yaml';

import {IFMergeArgs} from '../types/process-args';

/**
 * Merges the given manifests in the one file.
 */
export const mergeManifests = async (commandArgs: IFMergeArgs) => {
  const {manifests: commandManifests, name, description} = commandArgs;
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
  const manifestName = name
    ? `${name.replace(' ', '-')}.yaml`
    : 'merged-manifest.yaml';
  const outputPath = path.join(manifestPath, manifestName);

  await saveMergedManifest(tree, context, outputPath);
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
