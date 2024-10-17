import {ManifestInfo} from '../types/types';
import * as YAML from 'js-yaml';
import {EAS, SchemaEncoder} from '@ethereum-attestation-service/eas-sdk';
import {execPromise} from '../../common/util/helpers';
import {openYamlFileAsObject} from '../../common/util/yaml';
import {Manifest} from '../../common/types/manifest';
import {SCHEMA} from '../util/schema';
import {ethers, Wallet} from 'ethers';

const packageJson = require('../../../package.json');
const UID = process.env.SCHEMA_UID ?? '';

export const sendAttestationTx = async (
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

export const encodeSchema = (manifestInfo: ManifestInfo) => {
  const schemaEncoder = new SchemaEncoder(SCHEMA);
  const encodedData = schemaEncoder.encodeData([
    {name: 'start', value: manifestInfo.start, type: 'string'},
    {name: 'end', value: manifestInfo.end, type: 'string'},
    {name: 'hash', value: manifestInfo.hash, type: 'bytes32'},
    {name: 'if', value: manifestInfo.if, type: 'string'},
    {name: 'verified', value: manifestInfo.verified, type: 'bool'},
    {name: 'sci', value: manifestInfo.sci, type: 'uint64'},
    {name: 'energy', value: manifestInfo.energy, type: 'uint64'},
    {name: 'carbon', value: manifestInfo.carbon, type: 'uint64'},
    {name: 'level', value: manifestInfo.level, type: 'uint8'},
    {name: 'quality', value: manifestInfo.quality, type: 'uint8'},
    {
      name: 'functionalUnit',
      value: manifestInfo.functionalUnit,
      type: 'string',
    },
  ]);
  return encodedData;
};

export const getManifestStart = (manifest: Manifest): string => {
  const firstChildName = Object.keys(manifest.tree.children)[0] ?? 0;
  const manifestStart =
    manifest.tree.children[`${firstChildName}`].inputs[0].timestamp ?? 0;
  return manifestStart;
};

export const getManifestEnd = (manifest: Manifest): string => {
  const firstChildName = Object.keys(manifest.tree.children)[0];
  const inputsLength =
    manifest.tree.children[`${firstChildName}`].inputs.length ?? '';
  const manifestEnd =
    manifest.tree.children[`${firstChildName}`].inputs[inputsLength - 1]
      .timestamp ?? '';
  return manifestEnd;
};

export const getManifestInfo = async (
  manifestPath: string,
  level: number,
  functionalUnit: string
): Promise<ManifestInfo> => {
  const manifest = await openYamlFileAsObject<Manifest>(manifestPath);

  // const functionalUnitStub = file.initialize.plugins.sci['global-config']['functional-unit'] ??  '';

  const info: ManifestInfo = {
    start: getManifestStart(manifest),
    end: getManifestEnd(manifest),
    hash: GetManifestHash(manifest),
    if: GetIfVersion(),
    verified: await runIfCheck(manifestPath),
    sci: manifest.tree.aggregated.sci ?? 0,
    energy: manifest.tree.aggregated.energy ?? 0,
    carbon: manifest.tree.aggregated.carbon ?? 0,
    level: level,
    quality: 1, // quality score not yet functional in IF,
    functionalUnit: functionalUnit,
  };
  console.log(info);
  return info;
};

export const GetManifestHash = (manifest: Manifest): string => {
  const manifestAsString = YAML.dump(manifest).toString();
  const manifestAsBytes: Uint8Array = ethers.toUtf8Bytes(manifestAsString);
  const manifestHash = ethers.keccak256(manifestAsBytes);
  return manifestHash;
};

export const GetIfVersion = (): string => {
  return packageJson.version;
};

export const runIfCheck = async (manifestPath: string): Promise<boolean> => {
  const response = await execPromise(`npm run if-check -- -m ${manifestPath}`, {
    cwd: process.env.CURRENT_DIR || process.cwd(),
  });

  if (response.stdout.includes('if-check could not verify the manifest')) {
    console.log('IF-CHECK: verification was unsuccessful. Files do not match');
    return false;
  }
  console.log('IF-CHECK: verification was successful');

  return true;
};
