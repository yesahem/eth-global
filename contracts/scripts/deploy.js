import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MemoryLayer contract...");

  // Get the ContractFactory and Signers
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the MemoryLayer contract
  const MemoryLayer = await ethers.getContractFactory("MemoryLayer");
  const memoryLayer = await MemoryLayer.deploy();

  console.log("MemoryLayer contract deployed to:", memoryLayer.address);
  
  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await memoryLayer.deployTransaction.wait(5);
  
  console.log("✅ MemoryLayer deployed successfully!");
  
  // Output the contract address and ABI for frontend use
  console.log("\n📋 Contract Information:");
  console.log("Contract Address:", memoryLayer.address);
  console.log("Network:", process.env.HARDHAT_NETWORK || "localhost");
  console.log("Deployer:", deployer.address);
  
  // Save deployment info to a file
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: memoryLayer.address,
    network: process.env.HARDHAT_NETWORK || "localhost",
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };
  
  fs.writeFileSync(
    './deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("📁 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });