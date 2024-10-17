import {
  EAS,
  SignedOffchainAttestation,
} from '@ethereum-attestation-service/eas-sdk';
import {Wallet} from 'ethers';

const UID = process.env.SCHEMA_UID ?? '';

export const createOffchainAttestaton = async (
  eas: EAS,
  signer: Wallet,
  encodedData: string
): Promise<SignedOffchainAttestation> => {
  const offchain = await eas.getOffchain();

  const attestation = await offchain.signOffchainAttestation(
    {
      recipient: signer.address, //can provide an ethereum address for the attested org if needed- here it's the signer address
      expirationTime: BigInt(0),
      time: BigInt(Math.floor(Date.now() / 1000)),
      revocable: true, // Be aware that if your schema is not revocable, this MUST be false
      schema: UID,
      refUID:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      data: encodedData,
    },
    signer,
    {
      verifyOnchain: false,
    }
  );
  return attestation;
};

export const addSignerInfoToAttestation = (
  attestation: SignedOffchainAttestation,
  signer: Wallet
): string => {
  const prefix = '{"sig":';
  const suffix = `, "signer":${JSON.stringify(signer.address)}}`;
  return (
    prefix +
    JSON.stringify(attestation, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ) +
    suffix
  );
};
