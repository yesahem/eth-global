import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🚀 Deploying MemoryLayer contract to 0G Testnet...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📋 Deploying with account:', deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');
  
  // Get network info
  const network = await deployer.provider.getNetwork();
  console.log('🌐 Network:', {
    name: network.name,
    chainId: network.chainId.toString()
  });
  
  if (network.chainId !== 9000n) {
    throw new Error('❌ Not connected to 0G testnet! Expected chainId: 9000, got: ' + network.chainId);
  }
  
  // Deploy the contract
  console.log('\n📦 Deploying MemoryLayer contract...');
  
  const MemoryLayer = await ethers.getContractFactory('MemoryLayer');
  const memoryLayer = await MemoryLayer.deploy();
  
  console.log('⏳ Waiting for deployment transaction...');
  await memoryLayer.waitForDeployment();
  
  const contractAddress = await memoryLayer.getAddress();
  const deploymentTx = memoryLayer.deploymentTransaction();
  
  console.log('\n✅ MemoryLayer deployed successfully!');
  console.log('📍 Contract Address:', contractAddress);
  console.log('🔗 Transaction Hash:', deploymentTx?.hash);
  console.log('⛽ Gas Used:', deploymentTx?.gasLimit?.toString());
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: '0G Testnet',
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    transactionHash: deploymentTx?.hash,
    gasUsed: deploymentTx?.gasLimit?.toString()
  };
  
  const deploymentPath = path.join(__dirname, '../deployment-info-0g.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log('\n📄 Deployment info saved to:', deploymentPath);
  
  // Update backend environment configuration
  console.log('\n🔧 Update your backend .env file with:');
  console.log('CONTRACT_ADDRESS=' + contractAddress);
  console.log('ZG_RPC_URL=https://evmrpc-testnet.0g.ai');
  
  // Test contract functionality
  console.log('\n🧪 Testing contract functionality...');
  
  try {
    // Test write memory
    const testMemoryHash = 'QmTestHash0G' + Date.now();
    console.log('📝 Testing writeMemory with hash:', testMemoryHash);
    
    const writeTx = await memoryLayer.writeMemory(testMemoryHash);
    await writeTx.wait();
    console.log('✅ Write test successful');
    
    // Test read memory (this will fail due to balance requirement, but that's expected)
    console.log('📖 Testing readMemory...');
    try {
      const memories = await memoryLayer.readMemory(deployer.address);
      console.log('✅ Read test successful, memories found:', memories.length);
    } catch (error) {
      if (error instanceof Error && error.message.includes('InsufficientETHBalance')) {
        console.log('⚠️  Read test expected failure: Insufficient ETH balance (need 1.5 ETH)');
      } else {
        console.log('❌ Read test failed:', error);
      }
    }
    
    // Test memory count
    const count = await memoryLayer.getMemoryCount(deployer.address);
    console.log('📊 Memory count for deployer:', count.toString());
    
  } catch (error) {
    console.error('❌ Contract testing failed:', error);
  }
  
  console.log('\n🎉 Deployment to 0G Testnet completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Update backend/.env with the new CONTRACT_ADDRESS');
  console.log('2. Update backend/.env with ZG_RPC_URL=https://evmrpc-testnet.0g.ai');
  console.log('3. Update frontend to connect to 0G testnet (chainId: 9000)');
  console.log('4. Get 0G testnet tokens from faucet if needed');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });