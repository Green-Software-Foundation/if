import {SchemaRegistry} from '@ethereum-attestation-service/eas-sdk';
import {ethers} from 'ethers';
import * as dotenv from 'dotenv';
import {SCHEMA} from './schema';

dotenv.config();

/**
 * NOTE THAT YOU CAN ALSO CREATE A SCHEMA USING https://sepolia.easscan.org/schema/create
 */

const INFURA_API_KEY: string = process.env.INFURA_API_KEY ?? '';
const REGISTRY_CONTRACT_ADDRESS: string =
  process.env.REGISTRY_CONTRACT_ADDRESS_SEPOLIA ?? '';
const PRIVATE_KEY: string = process.env.ETH_PRIVATE_KEY ?? '';

export const RegisterSchema = async () => {
  const schemaRegistry = new SchemaRegistry(REGISTRY_CONTRACT_ADDRESS);

  const provider = new ethers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
  );

  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  schemaRegistry.connect(signer);

  const schema = SCHEMA;
  const revocable = true;
  const transaction = await schemaRegistry.register({
    schema,
    resolverAddress: undefined,
    revocable,
  });

  //Wait for transaction to be validated
  await transaction.wait();

  console.log('Transaction was successful: \n', transaction.data);
};
