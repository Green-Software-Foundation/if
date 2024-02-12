import {Manifest, ManifestCommon} from './manifest';

export type ContextTree = {
  tree: any;
  context: ManifestCommon;
  safeManifest: Manifest;
};
