#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {ethers, Wallet} from 'ethers';
import {ManifestInfo} from './types/types';
import * as YAML from 'js-yaml';
import {
  EAS,
  SchemaEncoder,
  SignedOffchainAttestation,
} from '@ethereum-attestation-service/eas-sdk';
import {execPromise} from '../common/util/helpers';
import {openYamlFileAsObject} from '../common/util/yaml';
import {Manifest} from '../common/types/manifest';
import {logger} from '../common/util/logger';
import {parseIfAttestArgs} from './util/args';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import {SCHEMA} from './util/schema';

const packageJson = require('../../package.json');
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

const IfAttest = async () => {
  const commandArgs = await parseIfAttestArgs();
  const manifestPath = commandArgs.manifest;

  const signer = createSigningWallet();
  const eas = new EAS(EAS_CONTRACT_ADDRESS_SEPOLIA);
  eas.connect(signer);

  //todo: make level and functional-unit CLI args
  const level = 1;
  const functionalUnit = 'site-visits';
  const manifestInfo = await getManifestInfo(
    manifestPath,
    level,
    functionalUnit
  );

  console.log('Manifest info:', manifestInfo);

  const encodedData = encodeSchema(manifestInfo);
  console.log('successfully encoded data');

  if (commandArgs.blockchain) {
    console.log('creating attestation to post to blockchain');
    const responseMessage = await sendAttestationTx(eas, signer, encodedData);
    console.log(responseMessage);
  } else {
    console.log('creating attestation to save locally');
    const offchainAttestation = await createOffchainAttestaton(
      eas,
      signer,
      encodedData
    );
    console.log('Attestation: \n', offchainAttestation);
    fs.writeFile(
      'Attestation.txt',
      JSON.stringify(offchainAttestation, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      ),
      err => {
        if (err) throw err;
      }
    );
  }
};

const createOffchainAttestaton = async (
  eas: EAS,
  signer: Wallet,
  encodedData: string
): Promise<SignedOffchainAttestation> => {
  const offchain = await eas.getOffchain();

  const attestation: SignedOffchainAttestation =
    await offchain.signOffchainAttestation(
      {
        recipient: signer.address, //can provide an ethereum address for the attested org if needed- here it's the signer address
        expirationTime: BigInt(0),
        time: BigInt(Date.now()),
        revocable: true, // Be aware that if your schema is not revocable, this MUST be false
        schema: UID,
        refUID:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        data: encodedData,
      },
      signer
    );

  return attestation;
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

const getManifestStart = (manifest: Manifest): string => {
  const firstChildName = Object.keys(manifest.tree.children)[0] ?? 0;
  const manifestStart =
    manifest.tree.children[`${firstChildName}`].inputs[0].timestamp ?? 0;
  return manifestStart;
};

const getManifestEnd = (manifest: Manifest): string => {
  const firstChildName = Object.keys(manifest.tree.children)[0];
  const inputsLength =
    manifest.tree.children[`${firstChildName}`].inputs.length ?? '';
  const manifestEnd =
    manifest.tree.children[`${firstChildName}`].inputs[inputsLength - 1]
      .timestamp ?? '';
  return manifestEnd;
};

const getManifestInfo = async (
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
    quality: 1, // quality not yet functional in IF,
    functionalUnit: functionalUnit,
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

  if (response.stdout.includes('if-check could not verify the manifest')) {
    console.log('IF-CHECK: verification was unsuccessful. Files do not match');
    return false;
  }
  console.log('IF-CHECK: verification was successful');

  return true;
};

IfAttest().catch(error => {
  if (error instanceof Error) {
    logger.error(error);
    process.exit(2);
  }
});
