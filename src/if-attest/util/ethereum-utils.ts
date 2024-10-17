import {ethers, Wallet} from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();
const PRIVATE_KEY: string = process.env.ETH_PRIVATE_KEY ?? '';
const INFURA_API_KEY: string = process.env.INFURA_API_KEY ?? '';

export const createSigningWallet = (): Wallet => {
  const provider = new ethers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
  );
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return signer;
};
