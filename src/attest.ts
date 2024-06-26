#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {ethers} from 'ethers';
import {readFileSync} from 'fs';
import * as YAML from 'js-yaml';
//import { EAS } from '@ethereum-attestation-service/eas-sdk';

const IfAttest = async (manifestPath: string) => {
  const manifestHash = HashManifest(manifestPath);
  console.log(manifestHash);
};

const HashManifest = (manifestPath: string): string => {
  const manifest = YAML.load(readFileSync(manifestPath, 'utf8'));
  const manifestAsString = YAML.dump(manifest).toString();
  const manifestAsBytes: Uint8Array = ethers.toUtf8Bytes(manifestAsString);
  const manifestHash = ethers.keccak256(manifestAsBytes);
  return manifestHash;
};

IfAttest('/home/user/Code/if/manifests/examples/sci.yml');
