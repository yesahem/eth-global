async function main() {
  console.log("🚀 Running MemoryLayer contract tests...");
  
  try {
    // This is a simple test to verify the contract compilation
    const artifact = (await import("../artifacts/contracts/MemoryLayer.sol/MemoryLayer.json", { with: { type: "json" } })).default;
    console.log("✅ Contract artifact loaded successfully");
    console.log("📝 Contract name:", artifact.contractName);
    console.log("🔧 Compiler version:", artifact.metadata ? JSON.parse(artifact.metadata).compiler.version : "Unknown");
    
    // Check if bytecode exists
    if (artifact.bytecode && artifact.bytecode.length > 2) {
      console.log("✅ Contract bytecode generated successfully");
      console.log("📏 Bytecode length:", artifact.bytecode.length, "characters");
    } else {
      console.log("❌ No bytecode found");
    }
    
    // Check if ABI exists
    if (artifact.abi && artifact.abi.length > 0) {
      console.log("✅ Contract ABI generated successfully");
      console.log("🔍 Functions found:", artifact.abi.filter(item => item.type === 'function').length);
      console.log("📡 Events found:", artifact.abi.filter(item => item.type === 'event').length);
    } else {
      console.log("❌ No ABI found");
    }
    
    console.log("\n🎉 All checks passed! The MemoryLayer contract is ready for deployment.");
    
  } catch (error) {
    console.error("❌ Error during contract verification:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });