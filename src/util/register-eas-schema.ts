import {SchemaRegistry} from '@ethereum-attestation-service/eas-sdk';
import {ethers} from 'ethers';

const RpcUrl = 'http://localhost:8545';
const REGISTRY_CONTRACT_ADDRESS = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'; //Sepolia v0.26 // replace this with our schema contract address!

const PRIVATE_KEY = '0xh2487tfy8742fb834ygf98o3q4hg98';
const SCHEMA =
  'uint256 manifestStart, uint256 manifestEnd, bytes32 manifestHash, uint256 carbon, uint256 sci, uint256 energy';

const registerSchema = async () => {
  const schemaRegistry = new SchemaRegistry(REGISTRY_CONTRACT_ADDRESS);
  const provider = new ethers.JsonRpcProvider(RpcUrl);
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
