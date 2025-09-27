import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

export const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  
  // Blockchain configuration
  rpcUrls: {
    sepolia: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    zg: process.env.ZG_RPC_URL || 'https://evmrpc-testnet.0g.ai'
  },
  
  // Contract configuration
  privateKey: process.env.PRIVATE_KEY,
  contractAddress: process.env.CONTRACT_ADDRESS,
  
  // Storage service configuration
  pinata: {
    apiKey: process.env.PINATA_API_KEY,
    secretKey: process.env.PINATA_SECRET_KEY,
    gateway: 'https://gateway.pinata.cloud/ipfs/',
    apiUrl: 'https://api.pinata.cloud/pinning/pinJSONToIPFS'
  },
  
  // LLM configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: 'https://api.openai.com/v1/chat/completions'
  }
} as const;

// Contract ABI
export const CONTRACT_ABI = [
  "function writeMemory(string calldata memoryHash) external",
  "function readMemory(address agent) external view returns (string[] memory memories)",
  "function getMemoryCount(address agent) external view returns (uint256 count)",
  "event MemoryWritten(address indexed agent, string memoryHash, uint256 timestamp)"
] as const;

// Get the current RPC URL (prioritize 0G if available)
export function getCurrentRpcUrl(): string {
  return config.rpcUrls.zg && process.env.ZG_RPC_URL ? config.rpcUrls.zg : config.rpcUrls.sepolia;
}

// Initialize blockchain provider and contract
export function initializeBlockchain() {
  if (!config.privateKey || !config.contractAddress) {
    return { provider: null, wallet: null, contract: null };
  }

  const provider = new ethers.JsonRpcProvider(getCurrentRpcUrl(), undefined, {
    staticNetwork: true
  });
  
  const wallet = new ethers.Wallet(config.privateKey, provider);
  const contract = new ethers.Contract(config.contractAddress, CONTRACT_ABI, wallet);

  return { provider, wallet, contract };
}