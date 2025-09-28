import { run } from "hardhat";

async function main() {
  const contractAddress = process.argv[2];
  
  if (!contractAddress) {
    console.log("Usage: bun run verify.js <contract-address>");
    process.exit(1);
  }

  console.log("Verifying contract at:", contractAddress);
  
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // MemoryLayer has no constructor arguments
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Contract already verified!");
    } else {
      console.error("❌ Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });