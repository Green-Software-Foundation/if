import {SchemaRegistry} from '@ethereum-attestation-service/eas-sdk';
import {ethers} from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const INFURA_API_KEY: string = process.env.INFURA_API_KEY ?? '';
const REGISTRY_CONTRACT_ADDRESS: string =
  process.env.REGISTRY_CONTRACT_ADDRESS_SEPOLIA ?? '';
const PRIVATE_KEY: string = process.env.ETH_PRIVATE_KEY ?? '';
const SCHEMA =
  'string start, string end, bytes32 hash, string if, bool verified, uint8 sci, string unit, uint8 energy, uint8 carbon, uint8 level';

export const RegisterSchema = async () => {
  const schemaRegistry = new SchemaRegistry(REGISTRY_CONTRACT_ADDRESS);

  const provider = new ethers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
  );
  // provider.getBlockNumber().then((result) => {
  //   console.log("Current block number: " + result);})

  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  schemaRegistry.connect(signer);

  const schema = SCHEMA;
  const revocable = true;
  const transaction = await schemaRegistry.register({
    schema,
    revocable,
  });

  // Wait for transaction to be validated
  await transaction.wait();

  console.log('Transaction was successful: \n', transaction.data);
};
