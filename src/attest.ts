#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {ethers} from 'ethers';
import {readFileSync} from 'fs';
import * as YAML from 'js-yaml';
const packageJson = require('../package.json');
import {SchemaEncoder} from '@ethereum-attestation-service/eas-sdk';

const IfAttest = async (manifestPath: string) => {
  const manifestHash = GetManifestHash(manifestPath);
  const ifVersion = GetIfVersion();
  const encodedSchema = encodeSchema(manifestHash, ifVersion);
  console.log(manifestHash, ifVersion);
  console.log(encodedSchema);
};

const encodeSchema = (manifestHash: string, ifVersion: string) => {
  const schemaEncoder = new SchemaEncoder(
    'bytes32 manifestHash, string ifVersion'
  );
  const encodedData = schemaEncoder.encodeData([
    {name: 'manifestHash', value: manifestHash, type: 'bytes32'},
    {name: 'ifVersion', value: ifVersion, type: 'string'},
  ]);
  return encodedData;
};

const GetManifestHash = (manifestPath: string): string => {
  const manifest = YAML.load(readFileSync(manifestPath, 'utf8'));
  const manifestAsString = YAML.dump(manifest).toString();
  const manifestAsBytes: Uint8Array = ethers.toUtf8Bytes(manifestAsString);
  const manifestHash = ethers.keccak256(manifestAsBytes);
  return manifestHash;
};

const GetIfVersion = (): string => {
  return packageJson.version;
};

IfAttest('/home/joe/Code/if/manifests/examples/sci.yml');
