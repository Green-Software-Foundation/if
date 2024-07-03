#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {ethers, Wallet} from 'ethers';
// import {readFileSync} from 'fs';
import * as YAML from 'js-yaml';
import {EAS, SchemaEncoder} from '@ethereum-attestation-service/eas-sdk';
import {execPromise} from './util/helpers';
import {openYamlFileAsObject} from './util/yaml';
import {Manifest} from './types/manifest';
import * as dotenv from 'dotenv';

const packageJson = require('../package.json');
dotenv.config();

const EAS_CONTRACT_ADDRESS_SEPOLIA: string =
  process.env.EAS_CONTRACT_ADDRESS_SEPOLIA ?? '';
const UID = process.env.SCHEMA_UID ?? '';
const PRIVATE_KEY: string = process.env.ETH_PRIVATE_KEY ?? '';
const INFURA_API_KEY: string = process.env.INFURA_API_KEY ?? '';

const createSigningWallet = (): Wallet => {
  const provider = new ethers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
  );
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return signer;
};

const IfAttest = async (manifestPath: string) => {
  const signer = createSigningWallet();
  const eas = new EAS(EAS_CONTRACT_ADDRESS_SEPOLIA);
  eas.connect(signer);

  //todo: make level a CLI args
  const level = 0;
  const manifestInfo = await getManifestInfo(manifestPath, level);
  const encodedData = encodeSchema(manifestInfo);
  const responseMessage = await sendAttestationTx(eas, signer, encodedData);
  console.log(responseMessage);
};

const sendAttestationTx = async (
  eas: EAS,
  signer: Wallet,
  encodedData: string
): Promise<string> => {
  const tx = await eas.attest({
    schema: UID,
    data: {
      recipient: signer.address, //can provide an ethereum address for the attested org if needed- here it's the signer address
      expirationTime: BigInt(0),
      revocable: true, // Be aware that if your schema is not revocable, this MUST be false
      data: encodedData,
    },
  });
  const attestationUID = await tx.wait();
  return attestationUID;
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

const getManifestStart = (manifest: Manifest): string => {
  const firstChildName = Object.keys(manifest.tree.children)[0];
  const manifestStart =
    manifest.tree.children[`${firstChildName}`].inputs[0].timestamp;
  return manifestStart;
};

const getManifestEnd = (manifest: Manifest): string => {
  const firstChildName = Object.keys(manifest.tree.children)[0];
  const inputsLength =
    manifest.tree.children[`${firstChildName}`].inputs.length;
  const manifestEnd =
    manifest.tree.children[`${firstChildName}`].inputs[inputsLength - 1]
      .timestamp;
  return manifestEnd;
};

const getManifestInfo = async (
  manifestPath: string,
  level: number
): Promise<ManifestInfo> => {
  const manifest = await openYamlFileAsObject<Manifest>(manifestPath);

  // const functionalUnitStub = file.initialize.plugins.sci['global-config']['functional-unit'] ??  '';
  const functionalUnitStub = 'request'; //todo: DO NOT HARDCODE!
  const unit = 'carbon per ' + functionalUnitStub;

  const info: ManifestInfo = {
    start: getManifestStart(manifest),
    end: getManifestEnd(manifest),
    hash: GetManifestHash(manifest),
    if: GetIfVersion(),
    verified: await runIfCheck(manifestPath),
    sci: manifest.tree.aggregated.sci,
    unit: unit,
    energy: manifest.tree.aggregated.energy,
    carbon: manifest.tree.aggregated.carbon,
    level: level,
  };

  return info;
};

const GetManifestHash = (manifest: Manifest): string => {
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
