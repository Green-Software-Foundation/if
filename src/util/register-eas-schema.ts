import {SchemaRegistry} from '@ethereum-attestation-service/eas-sdk';
import {ethers} from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const RPC_URL: string = process.env.RPC_URL ?? '';
const REGISTRY_CONTRACT_ADDRESS: string =
  process.env.REGISTRY_CONTRACT_ADDRESS ?? ''; //Sepolia v0.26 // replace this with our schema contract address!
const PRIVATE_KEY: string = process.env.ETH_PRIVATE_KEY ?? '';
const SCHEMA =
  'uint256 manifestStart, uint256 manifestEnd, bytes32 manifestHash, uint256 carbon, uint256 sci, uint256 energy';

const registerSchema = async () => {
  const schemaRegistry = new SchemaRegistry(REGISTRY_CONTRACT_ADDRESS);
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  schemaRegistry.connect(signer);

  const resolverAddress = '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0'; // Sepolia 0.26
  const revocable = true;

  const transaction = await schemaRegistry.register({
    schema: SCHEMA,
    resolverAddress,
    revocable,
  });

  // Optional: Wait for transaction to be validated
  await transaction.wait();
};

registerSchema();
