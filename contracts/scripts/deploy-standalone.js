import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import "dotenv/config";

async function main() {
  console.log("🚀 Deploying MemoryLayer contract to Sepolia...");

  // Check environment variables
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in environment variables");
  }
  
  if (!process.env.SEPOLIA_URL) {
    throw new Error("SEPOLIA_URL not found in environment variables");
  }

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("📡 Deploying with account:", wallet.address);
  
  // Check balance
  const balance = await wallet.provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient balance for deployment. Need at least 0.01 ETH");
  }

  // Read the contract artifact
  const artifactPath = path.join(process.cwd(), "artifacts/contracts/MemoryLayer.sol/MemoryLayer.json");
  
  if (!fs.existsSync(artifactPath)) {
    throw new Error("Contract artifact not found. Run 'bun run compile' first");
  }
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  // Create contract factory
  const contractFactory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  // Deploy the contract
  console.log("⛓️  Deploying contract...");
  const contract = await contractFactory.deploy();
  
  console.log("📋 Transaction hash:", contract.deploymentTransaction().hash);
  console.log("⏳ Waiting for deployment...");
  
  // Wait for deployment
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("✅ MemoryLayer deployed to:", contractAddress);
  
  // Wait for a few confirmations
  console.log("🔄 Waiting for confirmations...");
  await contract.deploymentTransaction().wait(3);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: "sepolia",
    deployer: wallet.address,
    deployedAt: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction().hash
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), "deployment-info.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Address:", contractAddress);
  console.log("🔍 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("📁 Deployment info saved to deployment-info.json");
  
  // Test contract interaction
  console.log("\n🧪 Testing contract interaction...");
  try {
    const minBalance = await contract.MIN_ETH_BALANCE();
    console.log("✅ Contract responds! Min ETH Balance:", ethers.formatEther(minBalance), "ETH");
  } catch (error) {
    console.warn("⚠️  Contract test failed:", error.message);
  }
}

main()
  .then(() => {
    console.log("\n🚀 Ready for demo!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });