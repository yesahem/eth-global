#!/usr/bin/env node
import { ethers } from 'ethers';
import fs from 'fs';
import 'dotenv/config';

async function main() {
  console.log('🚀 Quick Deploy to 0G Testnet');
  
  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_URL || 'https://evmrpc-testnet.0g.ai');
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const balance = await provider.getBalance(deployer.address);
  
  console.log('Deployer:', deployer.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH');
  
  // Load contract artifacts and deploy
  const MemoryLayer = new ethers.ContractFactory(
    JSON.parse(fs.readFileSync('./artifacts/contracts/MemoryLayer.sol/MemoryLayer.json')).abi,
    JSON.parse(fs.readFileSync('./artifacts/contracts/MemoryLayer.sol/MemoryLayer.json')).bytecode,
    deployer
  );
  
  const memoryLayer = await MemoryLayer.deploy();
  await memoryLayer.waitForDeployment();
  const contractAddress = await memoryLayer.getAddress();
  
  console.log('✅ MemoryLayer deployed to:', contractAddress);
  console.log('\n📝 Update your .env files:');
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log('ZG_RPC_URL=https://evmrpc-testnet.0g.ai');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});