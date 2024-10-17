#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {
  EAS,
} from '@ethereum-attestation-service/eas-sdk';
import { logger } from '../common/util/logger';
import { parseIfAttestArgs } from './util/args';
import * as fs from 'fs';
import {createSigningWallet} from './util/ethereum-utils';
import {addSignerInfoToAttestation, createOffchainAttestaton} from './util/offchain-attestation-utils';
import {sendAttestationTx, encodeSchema, getManifestInfo } from './util/attestation-utils';

const EAS_CONTRACT_ADDRESS_SEPOLIA: string =
  process.env.EAS_CONTRACT_ADDRESS_SEPOLIA ?? '';

const IfAttest = async () => {
  console.debug('starting attestation');
  const commandArgs = await parseIfAttestArgs();

  // initialize command args
  const manifestPath = commandArgs.manifest;
  const level = commandArgs.level;
  const functionalUnit = commandArgs.unit;

  console.debug('initializing Ethereum account');
  const signer = createSigningWallet();
  const eas = new EAS(EAS_CONTRACT_ADDRESS_SEPOLIA);

  console.debug('creating signer object')
  eas.connect(signer);

  const manifestInfo = await getManifestInfo(
    manifestPath,
    level,
    functionalUnit
  );

  const encodedData = encodeSchema(manifestInfo);
  console.debug('successfully encoded attestation data');

  if (commandArgs.blockchain) {
    console.log('creating attestation to post to blockchain');
    const responseMessage = await sendAttestationTx(eas, signer, encodedData);
    fs.writeFile('tx-info.txt', responseMessage, err => {
      if (err) throw err;
    });
  } else {
    console.log('creating attestation to save locally');
    const offchainAttestation = await createOffchainAttestaton(
      eas,
      signer,
      encodedData
    );
    const offchainAttestationWithSignerInfo = addSignerInfoToAttestation(
      offchainAttestation,
      signer
    );
    fs.writeFile('Attestation.txt', offchainAttestationWithSignerInfo, err => {
      if (err) throw err;
    });
  }
};


IfAttest().catch(error => {
  if (error instanceof Error) {
    logger.error(error);
    process.exit(2);
  }
});
