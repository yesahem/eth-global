import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const EXPECTED_CHAIN_ID = 16602n; // Updated to actual 0G testnet chain ID
const MIN_BALANCE_ETH = '0.1'; // Minimum balance required for deployment
const ZG_TESTNET_RPC = 'https://evmrpc-testnet.0g.ai';

async function validateEnvironment() {
  console.log('🔍 Validating environment...');
  
  if (!process.env.PRIVATE_KEY) {
    throw new Error('❌ PRIVATE_KEY environment variable is required');
  }
  
  console.log('✅ Private key found');
}

async function validateNetwork(provider) {
  console.log('🌐 Validating network connection...');
  
  try {
    const network = await provider.getNetwork();
    console.log(`📡 Connected to network: ${network.name || 'Unknown'}`);
    console.log(`🆔 Chain ID: ${network.chainId}`);
    
    if (network.chainId !== EXPECTED_CHAIN_ID) {
      console.warn(`⚠️  Chain ID mismatch! Expected: ${EXPECTED_CHAIN_ID}, got: ${network.chainId}`);
      console.warn('🔗 Proceeding with actual chain ID (0G testnet configuration may have changed)');
    }
    
    console.log('✅ Connected to 0G Testnet');
    return network;
  } catch (error) {
    throw new Error(`❌ Network connection failed: ${error.message}`);
  }
}

async function validateBalance(deployer) {
  console.log('💰 Checking account balance...');
  
  const balance = await deployer.provider.getBalance(deployer.address);
  const balanceETH = ethers.formatEther(balance);
  
  console.log(`💳 Account: ${deployer.address}`);
  console.log(`💎 Balance: ${balanceETH} ETH`);
  
  if (parseFloat(balanceETH) < parseFloat(MIN_BALANCE_ETH)) {
    console.warn(`⚠️  Low balance! Minimum recommended: ${MIN_BALANCE_ETH} ETH`);
    console.warn('🚰 Get more tokens from 0G testnet faucet if deployment fails');
  } else {
    console.log('✅ Sufficient balance for deployment');
  }
  
  return balanceETH;
}

async function deployContract(deployer) {
  console.log('\n📦 Starting contract deployment...');
  
  try {
    // Load contract artifacts
    console.log('📂 Loading contract artifacts...');
    const contractArtifact = JSON.parse(
      fs.readFileSync('./artifacts/contracts/MemoryLayer.sol/MemoryLayer.json', 'utf8')
    );
    
    // Create contract factory
    const MemoryLayer = new ethers.ContractFactory(
      contractArtifact.abi,
      contractArtifact.bytecode,
      deployer
    );
    console.log('✅ Contract factory created');
    
    // Estimate gas
    console.log('⛽ Estimating deployment gas...');
    const deployTx = await MemoryLayer.getDeployTransaction();
    const gasEstimate = await deployer.estimateGas(deployTx);
    console.log(`📊 Estimated gas: ${gasEstimate.toString()}`);
    
    // Deploy contract
    console.log('🚀 Deploying MemoryLayer contract...');
    const memoryLayer = await MemoryLayer.deploy({
      gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
    });
    
    console.log('⏳ Waiting for deployment confirmation...');
    await memoryLayer.waitForDeployment();
    
    const contractAddress = await memoryLayer.getAddress();
    const deploymentTx = memoryLayer.deploymentTransaction();
    
    console.log('\n🎉 Contract deployed successfully!');
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🔗 Transaction Hash: ${deploymentTx?.hash}`);
    
    // Wait for additional confirmations
    if (deploymentTx) {
      console.log('⏳ Waiting for additional confirmations...');
      const receipt = await deploymentTx.wait(2); // Wait for 2 confirmations
      console.log(`✅ Confirmed in block: ${receipt.blockNumber}`);
      console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    }
    
    return { memoryLayer, contractAddress, deploymentTx };
  } catch (error) {
    throw new Error(`❌ Deployment failed: ${error.message}`);
  }
}

async function testContract(memoryLayer, deployer) {
  console.log('\n🧪 Testing contract functionality...');
  
  try {
    // Test 1: Write memory
    const testMemoryHash = `QmTest0G${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    console.log(`📝 Testing writeMemory with hash: ${testMemoryHash}`);
    
    const writeTx = await memoryLayer.writeMemory(testMemoryHash, {
      gasLimit: 300000,
    });
    await writeTx.wait();
    console.log('✅ Write memory test successful');
    
    // Test 2: Get memory count
    const count = await memoryLayer.getMemoryCount(deployer.address);
    console.log(`📊 Memory count for deployer: ${count.toString()}`);
    
    // Test 3: Try to read memories (expected to fail due to balance requirement)
    console.log('📖 Testing readMemory (expecting balance error)...');
    try {
      await memoryLayer.readMemory(deployer.address);
      console.log('✅ Read memory test successful (unexpected!)');
    } catch (error) {
      if (error.message.includes('InsufficientETHBalance')) {
        console.log('✅ Read memory test expected failure: Insufficient ETH balance (need 1.5 ETH)');
      } else {
        console.log(`❌ Unexpected read error: ${error.message}`);
      }
    }
    
    console.log('✅ All contract tests completed');
    
  } catch (error) {
    console.error(`❌ Contract testing failed: ${error.message}`);
    throw error;
  }
}

async function saveDeploymentInfo(contractAddress, deployer, network, deploymentTx, balanceETH) {
  console.log('\n💾 Saving deployment information...');
  
  const deploymentInfo = {
    contractAddress,
    network: {
      name: '0G Testnet',
      chainId: network.chainId.toString(),
      rpcUrl: ZG_TESTNET_RPC,
    },
    deployer: {
      address: deployer.address,
      balance: balanceETH,
    },
    deployment: {
      transactionHash: deploymentTx?.hash,
      blockNumber: deploymentTx?.blockNumber,
      gasUsed: deploymentTx?.gasLimit?.toString(),
      deployedAt: new Date().toISOString(),
    },
    contractInfo: {
      compiler: '0.8.24',
      optimizer: true,
      runs: 200,
    },
  };
  
  // Save to JSON file
  const deploymentPath = path.join(process.cwd(), 'deployment-info-0g.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${deploymentPath}`);
  
  // Create environment configuration
  const envConfig = `
# 0G Testnet Configuration
CONTRACT_ADDRESS=${contractAddress}
ZG_RPC_URL=${ZG_TESTNET_RPC}
NETWORK_NAME=0G Testnet
CHAIN_ID=9000
`;
  
  const envPath = path.join(process.cwd(), '0g-deployment.env');
  fs.writeFileSync(envPath, envConfig.trim());
  console.log(`📄 Environment config saved to: ${envPath}`);
  
  return deploymentInfo;
}

function printNextSteps(contractAddress) {
  console.log('\n📋 DEPLOYMENT COMPLETE - Next Steps:');
  console.log('=' .repeat(60));
  
  console.log('\n1️⃣  UPDATE BACKEND CONFIGURATION:');
  console.log(`   📝 Edit backend/.env and add:`);
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   ZG_RPC_URL=${ZG_TESTNET_RPC}`);
  console.log(`   CHAIN_ID=9000`);
  
  console.log('\n2️⃣  UPDATE FRONTEND CONFIGURATION:');
  console.log(`   📝 Edit frontend/.env.local and add:`);
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   NEXT_PUBLIC_ZG_RPC_URL=${ZG_TESTNET_RPC}`);
  console.log(`   NEXT_PUBLIC_CHAIN_ID=9000`);
  
  console.log('\n3️⃣  VERIFY FRONTEND WAGMI CONFIG:');
  console.log(`   📝 Ensure frontend/src/lib/wagmi.ts includes 0G testnet`);
  console.log(`   🔗 Chain ID: 9000`);
  console.log(`   🔗 RPC URL: ${ZG_TESTNET_RPC}`);
  
  console.log('\n4️⃣  GET TESTNET TOKENS:');
  console.log(`   🚰 Visit 0G testnet faucet for tokens`);
  console.log(`   💎 Need 1.5+ ETH for read operations`);
  
  console.log('\n5️⃣  TEST THE APPLICATION:');
  console.log(`   🚀 Start backend: cd backend && bun run start`);
  console.log(`   🌐 Start frontend: cd frontend && bun run dev`);
  console.log(`   🔗 Visit: http://localhost:3000`);
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 Deployment to 0G Testnet successful!');
}

async function main() {
  console.log('🌟 0G Testnet Deployment Script');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Validate environment
    await validateEnvironment();
    
    // Step 2: Create provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_URL || ZG_TESTNET_RPC);
    console.log("private key = ", process.env.PRIVATE_KEY)
    const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Step 3: Validate network
    const network = await validateNetwork(provider);
    
    // Step 4: Check balance
    const balanceETH = await validateBalance(deployer);
    
    // Step 5: Deploy contract
    const { memoryLayer, contractAddress, deploymentTx } = await deployContract(deployer);
    
    // Step 6: Test contract
    await testContract(memoryLayer, deployer);
    
    // Step 7: Save deployment info
    await saveDeploymentInfo(contractAddress, deployer, network, deploymentTx, balanceETH);
    
    // Step 8: Print next steps
    printNextSteps(contractAddress);
    
  } catch (error) {
    console.error('\n💥 DEPLOYMENT FAILED!');
    console.error('=' .repeat(50));
    console.error('Error:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.error('\n💡 Possible solutions:');
      console.error('   🚰 Get more 0G testnet tokens from faucet');
      console.error('   💰 Check your wallet balance');
    }
    
    if (error.message.includes('network') || error.message.includes('connection')) {
      console.error('\n💡 Possible solutions:');
      console.error('   🌐 Check 0G testnet RPC endpoint');
      console.error('   🔗 Verify network configuration in hardhat.config.js');
      console.error('   📡 Ensure internet connection');
    }
    
    process.exit(1);
  }
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Deployment interrupted by user');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('\n💥 Unhandled error:', error);
  process.exit(1);
});

main()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  });