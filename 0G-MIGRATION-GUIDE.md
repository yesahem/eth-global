# 🔄 Migrating to 0G Testnet Deployment Guide

## 🎯 Overview

This guide will help you migrate your Decentralized Memory Layer from Ethereum Sepolia to 0G Testnet, taking advantage of 0G's optimized storage capabilities and lower transaction costs.

---

## 📋 Prerequisites

### 1. **0G Testnet Tokens**
- Get 0G testnet tokens from the official faucet
- You'll need tokens for contract deployment and transaction fees
- Recommended: Get at least 10 0G tokens for testing

### 2. **Wallet Configuration**
- Add 0G testnet to your MetaMask wallet
- Network details:
  ```
  Network Name: 0G Testnet
  RPC URL: https://evmrpc-testnet.0g.ai
  Chain ID: 9000
  Currency Symbol: 0G
  Block Explorer: https://chainscan-newton.0g.ai
  ```

---

## 🚀 Step-by-Step Migration

### Step 1: Update Environment Configuration

1. **Update contracts/.env**:
```bash
cd contracts
cp .env.example .env
```

2. **Add 0G configuration to .env**:
```env
# Network Configuration
ZG_RPC_URL=https://evmrpc-testnet.0g.ai
PRIVATE_KEY=your_private_key_here

# Optional: Keep Sepolia for fallback
SEPOLIA_URL=https://ethereum-sepolia-rpc.publicnode.com
```

### Step 2: Deploy Contract to 0G Testnet

1. **Compile contracts**:
```bash
cd contracts
npm install
npx hardhat compile
```

2. **Deploy to 0G testnet**:
```bash
npx hardhat run scripts/deploy-0g.js --network zgtestnet
```

3. **Expected output**:
```
🚀 Deploying MemoryLayer contract to 0G Testnet...
📋 Deploying with account: 0xYourAddress...
💰 Account balance: X.XXX ETH
🌐 Network: { name: 'unknown', chainId: '9000' }

📦 Deploying MemoryLayer contract...
⏳ Waiting for deployment transaction...

✅ MemoryLayer deployed successfully!
📍 Contract Address: 0xNewContractAddress...
🔗 Transaction Hash: 0xTransactionHash...

📄 Deployment info saved to: deployment-info-0g.json
```

### Step 3: Update Backend Configuration

1. **Update backend/.env**:
```env
# Server Configuration
PORT=3001

# Blockchain Configuration - Use 0G Testnet
ZG_RPC_URL=https://evmrpc-testnet.0g.ai
CONTRACT_ADDRESS=0xYourNew0GContractAddress
PRIVATE_KEY=your_private_key_here

# Keep existing IPFS configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

2. **Restart backend server**:
```bash
cd backend
bun src/server.ts
```

3. **Verify logs show 0G connection**:
```
🚀 Memory Layer Backend running on port 3001
📡 Network: 0G Testnet (Chain ID: 9000)
🔗 RPC URL: https://evmrpc-testnet.0g.ai
⛓️  Contract: 0xYourNew0GContractAddress
```

### Step 4: Update Frontend Network

The frontend has been configured to support 0G testnet. When you connect your wallet:

1. **MetaMask will prompt** to switch to 0G Testnet
2. **Or manually switch** to the 0G network in MetaMask
3. **Verify connection** - you should see "0G Testnet" in the top navigation

### Step 5: Test the Migration

1. **Connect wallet** to 0G testnet
2. **Write a test memory**:
   - Enter some test content
   - Click "Store Memory"
   - Confirm the transaction in MetaMask
   - Verify success message with IPFS hash

3. **Read the memory**:
   - Use your wallet address in the read section
   - Click "Read Memories"
   - Verify the content appears

---

## 🔧 Troubleshooting

### **Network Connection Issues**
```bash
# Check if 0G testnet is accessible
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://evmrpc-testnet.0g.ai
```

### **Contract Not Found**
- Verify the contract address in your `.env` file
- Check the deployment was successful
- Ensure you're connected to the correct network (Chain ID: 9000)

### **Insufficient Balance for Reads**
- 0G testnet still requires 1.5 ETH equivalent balance
- Get more 0G tokens from the faucet
- Or modify the contract's `MIN_ETH_BALANCE` if needed

### **MetaMask Network Issues**
1. **Manually add 0G testnet**:
   - Settings → Networks → Add Network
   - Use the network details provided above

2. **Clear MetaMask cache** if connection fails:
   - Settings → Advanced → Reset Account

---

## 📊 Comparison: Sepolia vs 0G Testnet

| Feature | Ethereum Sepolia | 0G Testnet |
|---------|------------------|-------------|
| **Transaction Speed** | ~15 seconds | ~3 seconds |
| **Gas Costs** | Higher | Lower |
| **Storage Integration** | External IPFS | Native 0G storage |
| **Network Maturity** | Stable | Newer |
| **Ecosystem** | Large | Growing |

---

## 🎯 Benefits of 0G Testnet

### **🚀 Performance Improvements**
- **Faster transactions** (~3 seconds vs ~15 seconds)
- **Lower gas costs** for contract interactions
- **Better storage integration** with 0G's native storage layer

### **🔗 Native Storage Integration** 
- Direct integration with 0G storage protocol
- Reduced dependency on external IPFS services
- Better performance for large memory content

### **💰 Cost Efficiency**
- Lower transaction fees for memory operations
- More cost-effective for high-frequency AI agent interactions
- Better suited for production AI workloads

---

## 🔄 Rollback Plan

If you need to revert to Sepolia:

1. **Update backend/.env**:
```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
CONTRACT_ADDRESS=0x8E9141c3C8dA0ABf8D3193Da2c47dc1AF71D5344
# Comment out: ZG_RPC_URL=...
```

2. **Update frontend** to show "Sepolia Testnet"
3. **Restart services** and connect MetaMask to Sepolia

---

## 📚 Next Steps

After successful migration:

1. **Integrate 0G Storage** - Replace IPFS with native 0G storage
2. **Optimize for 0G** - Take advantage of 0G-specific features
3. **Monitor Performance** - Compare metrics vs Sepolia deployment
4. **Scale Testing** - Test with larger memory datasets

---

## 🆘 Support Resources

- **0G Documentation**: [Official 0G Docs](https://docs.0g.ai)
- **0G Discord**: Join for community support
- **Block Explorer**: https://chainscan-newton.0g.ai
- **Faucet**: Get testnet tokens from official faucet

Your Decentralized Memory Layer is now running on 0G testnet! 🎉