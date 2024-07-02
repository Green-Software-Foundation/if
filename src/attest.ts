#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {ethers} from 'ethers';
import {readFileSync} from 'fs';
import * as YAML from 'js-yaml';
const packageJson = require('../package.json');
import {SchemaEncoder} from '@ethereum-attestation-service/eas-sdk';
import {execPromise} from './util/helpers';
import {openYamlFileAsObject} from './util/yaml';
import {Manifest} from './types/manifest';

const IfAttest = async (manifestPath: string) => {
  //todo: make level a CLI argument
  const level = 0;

  const manifestInfo = await getManifestInfo(manifestPath, level);
  const encodedSchema = encodeSchema(manifestInfo);

  console.log(manifestInfo);
  console.log(encodedSchema);
};

const encodeSchema = (manifestInfo: ManifestInfo) => {
  const schemaEncoder = new SchemaEncoder(
    'string start, string end, bytes32 hash, string if, bool verified, uint8 sci, string unit, uint8 energy, uint8 carbon, uint8 level'
  );
  const encodedData = schemaEncoder.encodeData([
    {name: 'start', value: manifestInfo.start, type: 'string'},
    {name: 'end', value: manifestInfo.end, type: 'string'},
    {name: 'hash', value: manifestInfo.hash, type: 'bytes32'},
    {name: 'if', value: manifestInfo.if, type: 'string'},
    {name: 'verified', value: manifestInfo.verified, type: 'bool'},
    {name: 'sci', value: manifestInfo.sci, type: 'uint8'},
    {name: 'unit', value: manifestInfo.unit, type: 'string'},
    {name: 'energy', value: manifestInfo.energy, type: 'uint8'},
    {name: 'carbon', value: manifestInfo.carbon, type: 'uint8'},
    {name: 'level', value: manifestInfo.level, type: 'uint8'},
  ]);
  return encodedData;
};

type ManifestInfo = {
  start: string;
  end: string;
  hash: string;
  if: string;
  verified: boolean;
  sci: number;
  unit: string; // aggregated SCI (from the top level of the `tree`)aggregate
  energy: number; // aggregated energy (value from the top level of the `tree`)
  carbon: number; // aggregated carbon (value from the top level of the `tree`)
  level: number; // 0-5 GSF review thoroughness score
};

const getManifestInfo = async (
  manifestPath: string,
  level: number
): Promise<ManifestInfo> => {
  const file = await openYamlFileAsObject<Manifest>(manifestPath);

  // const functionalUnitStub = file.initialize.plugins.sci['global-config']['functional-unit'] ??  '';
  const functionalUnitStub = 'request'; //todo: DO NOT HARDCODE!
  const unit = 'carbon per ' + functionalUnitStub;

  const info: ManifestInfo = {
    start: file.tree.children.child.outputs[0].timestamp,
    end: file.tree.children.child.outputs[
      file.tree.children.child.outputs.length - 1
    ].timestamp,
    hash: GetManifestHash(manifestPath),
    if: GetIfVersion(),
    verified: await runIfCheck(manifestPath),
    sci: file.tree.aggregated.sci,
    unit: unit,
    energy: file.tree.aggregated.energy,
    carbon: file.tree.aggregated.carbon,
    level: level,
  };

  return info;
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

IfAttest('/home/joe/Code/if/manifests/outputs/coefficient.yaml');
