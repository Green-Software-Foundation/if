#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {ethers} from 'ethers';
import {readFileSync} from 'fs';
import * as YAML from 'js-yaml';
const packageJson = require('../package.json');
import {SchemaEncoder} from '@ethereum-attestation-service/eas-sdk';
import {execPromise} from './util/helpers';

const IfAttest = async (manifestPath: string) => {
  const manifestHash = GetManifestHash(manifestPath);
  const ifVersion = GetIfVersion();
  const isVerified = await runIfCheck(manifestPath);
  const encodedSchema = encodeSchema(manifestHash, ifVersion, isVerified);

  console.log(manifestHash, ifVersion, isVerified);
  console.log(encodedSchema);
};

const encodeSchema = (
  manifestHash: string,
  ifVersion: string,
  isVerified: boolean
) => {
  const schemaEncoder = new SchemaEncoder(
    'bytes32 manifestHash, string ifVersion, bool isVerified'
  );
  const encodedData = schemaEncoder.encodeData([
    {name: 'manifestHash', value: manifestHash, type: 'bytes32'},
    {name: 'ifVersion', value: ifVersion, type: 'string'},
    {name: 'isVerified', value: isVerified, type: 'bool'},
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

const runIfCheck = async (manifestPath: string): Promise<boolean> => {
  const response = await execPromise(`npm run if-check -- -m ${manifestPath}`, {
    cwd: process.env.CURRENT_DIR || process.cwd(),
  });

  if (response.stdout.includes('if-check could not verify')) {
    console.log('IF-CHECK: verification was unsuccessful. Files do not match');
    return false;
  }
  console.log('IF-CHECK: verification was successful');

  return true;
};

IfAttest('/home/joe/Code/if/manifests/outputs/teads.yaml');
