# Developers Guide - Decentralized Memory Layer

## 🎯 Project Overview

This is a **hackathon MVP** built in 18 hours demonstrating a decentralized memory layer for AI agents. The system uses:

- **Ethereum Sepolia** for access control and memory references
- **IPFS (Pinata)** for decentralized storage with 0G Network fallback
- **Smart Contracts** for on-chain memory indexing and access control
- **Node.js Backend** for IPFS integration and AI summarization  
- **Next.js Frontend** for user interaction with Web3 wallet integration

## 🏗️ Architecture Deep Dive

### Data Flow
1. **Write Flow**: User → Frontend → Backend → IPFS → Smart Contract
2. **Read Flow**: User → Frontend → Backend → Smart Contract → IPFS → User
3. **Access Control**: Smart Contract checks ETH balance ≥ 1.5 ETH for reads

### Smart Contract Design

```solidity
contract MemoryLayer {
    mapping(address => string[]) private agentMemories;
    uint256 public constant MIN_ETH_BALANCE = 1.5 ether;
    
    function writeMemory(string calldata memoryHash) external;
    function readMemory(address agent) external view returns (string[] memory);
}
```

**Key Design Decisions:**
- Store only IPFS hashes on-chain (gas optimization)
- Use `view` function for balance checking (no gas for reads)
- Agent-centric storage (each address owns their memories)

### Backend Architecture

```typescript
// Core components:
- IPFS Integration (Pinata SDK)
- Ethereum Contract Interaction (ethers.js) 
- Memory Summarization (OpenAI API)
- RESTful API (Express.js)
- Periodic Jobs (node-cron)
```

**Key Features:**
- Fallback storage mechanism (IPFS → 0G Network)
- Automatic contract interaction
- Memory compression for large datasets
- CORS and security middleware

### Frontend Architecture

```typescript
// Core components:
- Wallet Connection (Wagmi + MetaMask)
- Balance Checking (Real-time ETH balance)
- Contract Interaction (Viem + Ethers.js)
- Responsive UI (Tailwind CSS)
- Error Handling (User-friendly messages)
```

## 🛠️ Local Development Setup

### Prerequisites
```bash
# Required software
- Node.js 18+ or Bun 1.0+
- MetaMask browser extension
- Git
```

### Environment Setup

1. **Get Testnet ETH**
   ```bash
   # Sepolia Faucets:
   - https://sepoliafaucet.com/
   - https://faucet.sepolia.dev/
   # Send to your wallet address
   ```

2. **Get API Keys**
   ```bash
   # Pinata (IPFS):
   - Sign up at https://pinata.cloud
   - Generate API key and secret
   
   # OpenAI (optional):
   - Sign up at https://openai.com
   - Generate API key
   
   # Etherscan (optional):
   - Sign up at https://etherscan.io
   - Generate API key for contract verification
   ```

3. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd decentralized-memory-layer
   
   # Install all dependencies
   bun install --recursive
   # or manually:
   cd contracts && bun install
   cd ../backend && bun install  
   cd ../frontend && bun install
   ```

### Configuration

**1. Contracts Configuration**
```bash
cd contracts
cp .env.example .env

# Edit .env:
SEPOLIA_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**2. Backend Configuration**
```bash
cd backend
cp .env.example .env

# Edit .env:
PORT=3001
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
CONTRACT_ADDRESS=deployed_contract_address_after_deployment
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
OPENAI_API_KEY=your_openai_api_key_optional
```

**3. Frontend Configuration**
```bash
cd frontend
cp .env.example .env.local

# Edit .env.local:
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address_after_deployment
NEXT_PUBLIC_SEPOLIA_CHAIN_ID=11155111
```

## 🚀 Development Workflow

### 1. Smart Contract Development

```bash
cd contracts

# Compile contracts
bun run compile

# Run tests
bun run test

# Deploy to local network
bun run node            # Terminal 1: Start Hardhat node
bun run deploy:localhost # Terminal 2: Deploy to localhost

# Deploy to Sepolia
bun run deploy:sepolia

# Verify on Etherscan
bun run verify <CONTRACT_ADDRESS>
```

### 2. Backend Development

```bash
cd backend

# Start development server
bun run dev

# The backend will:
- Start on http://localhost:3001
- Connect to Ethereum network
- Initialize IPFS connection
- Start periodic summarization (every 10 minutes)
```

**Backend Endpoints:**
- `POST /write` - Store memory
- `GET /read` - Retrieve memories  
- `GET /count/:agent` - Get memory count
- `GET /health` - Health check

### 3. Frontend Development

```bash
cd frontend

# Start development server
bun run dev

# Features available:
- Wallet connection at http://localhost:3000
- Write memory interface
- Read memory interface
- Balance checking
```

## 🧪 Testing Strategy

### Contract Testing
```bash
cd contracts
bun run test

# Test coverage:
- Memory write operations
- Access control (balance checking)
- Memory read operations  
- Owner functions
- Error handling
```

### Integration Testing

**Create Test Wallets:**
```bash
# Wallet A (Low Balance < 1.5 ETH):
1. Create new MetaMask wallet
2. Send 0.5 ETH from faucet
3. Test write operations (should work)
4. Test read operations (should fail)

# Wallet B (High Balance > 1.5 ETH):  
1. Create new MetaMask wallet
2. Send 2.0 ETH from faucet  
3. Test write operations (should work)
4. Test read operations (should work)
```

**Test Scenarios:**
1. Write memory with Wallet A → Success
2. Read own memories with Wallet A → Fail (insufficient balance)
3. Read Wallet A memories with Wallet B → Success
4. Cross-agent memory queries → Success

### Manual Testing Checklist

**Frontend:**
- [ ] Wallet connection works
- [ ] Balance display accurate
- [ ] Write memory succeeds
- [ ] Read memory respects access control
- [ ] Error messages clear
- [ ] Loading states work

**Backend:**
- [ ] IPFS upload succeeds
- [ ] Contract interaction works
- [ ] Memory retrieval works
- [ ] API error handling
- [ ] CORS configured properly

**Smart Contract:**
- [ ] Memory write events emitted
- [ ] Access control enforced
- [ ] Balance checking accurate
- [ ] Gas costs reasonable

## 🔧 Advanced Configuration

### Custom RPC Endpoints
```javascript
// hardhat.config.js
networks: {
  sepolia: {
    url: process.env.SEPOLIA_URL || "YOUR_CUSTOM_RPC",
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

### IPFS Configuration
```javascript
// backend/src/services/ipfs.js
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_KEY
});
```

### 0G Network Integration (Future)
```javascript
// backend/src/services/0g.js
// When 0G SDK becomes available:
const zeroG = new ZeroGSDK({
  endpoint: process.env.ZG_ENDPOINT,
  apiKey: process.env.ZG_API_KEY
});
```

## 🐛 Common Issues & Solutions

### Contract Deployment Issues
```bash
# Issue: "replacement fee too low"
# Solution: Increase gas price in hardhat.config.js

networks: {
  sepolia: {
    gasPrice: 20000000000, // 20 gwei
  }
}
```

### Frontend Connection Issues
```bash
# Issue: "Cannot connect to localhost"  
# Solution: Check MetaMask network (should be Sepolia)

# Issue: "Contract not deployed"
# Solution: Verify CONTRACT_ADDRESS in .env.local
```

### Backend API Issues
```bash
# Issue: "CORS error"
# Solution: Add frontend URL to CORS whitelist

# Issue: "IPFS upload failed"
# Solution: Check Pinata API keys and network connection
```

## 📊 Performance Considerations

### Gas Optimization
- Store only IPFS hashes on-chain (32 bytes vs full content)
- Use `view` functions for balance checking (no gas cost)
- Batch memory writes when possible

### IPFS Performance  
- Use Pinata for faster retrieval
- Implement local IPFS caching
- Fallback to 0G Network for redundancy

### Frontend Performance
- Lazy load memory content
- Implement pagination for large memory sets
- Cache wallet balance checks

## 🚀 Deployment Guide

### Smart Contract Deployment

```bash
# 1. Deploy to Sepolia
cd contracts
bun run deploy:sepolia

# 2. Verify contract (optional)
bun run verify <CONTRACT_ADDRESS>

# 3. Update backend/frontend configs with CONTRACT_ADDRESS
```

### Backend Deployment (Render)

```yaml
# render.yaml
services:
  - type: web
    name: memory-layer-backend
    env: node
    buildCommand: cd backend && bun install
    startCommand: cd backend && bun start
    envVars:
      - key: PORT
        value: 10000
      - key: CONTRACT_ADDRESS
        fromDatabase: false
        value: <YOUR_CONTRACT_ADDRESS>
```

### Frontend Deployment (Vercel)

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "cd frontend && bun run build",
  "outputDirectory": "frontend/.next",
  "env": {
    "NEXT_PUBLIC_CONTRACT_ADDRESS": "<YOUR_CONTRACT_ADDRESS>",
    "NEXT_PUBLIC_API_URL": "<YOUR_BACKEND_URL>"
  }
}
```

## 📋 Deployment Checklist

- [ ] Contract deployed to Sepolia
- [ ] Contract verified on Etherscan  
- [ ] Backend deployed with correct env vars
- [ ] Frontend deployed with correct env vars
- [ ] API CORS configured for production domain
- [ ] Test with both wallet scenarios
- [ ] Demo video recorded

## 🔮 Future Enhancements

### Immediate (Post-Hackathon)
- [ ] 0G Network integration
- [ ] Memory encryption
- [ ] Batch operations
- [ ] Memory search functionality

### Long-term
- [ ] Multi-chain deployment
- [ ] AI-powered memory recommendations  
- [ ] Memory sharing permissions
- [ ] Analytics dashboard

## 💡 Tips for Hackathon Judges

1. **Test Both Scenarios**: Use wallets with high/low balance
2. **Check Contract**: Verify on Sepolia Etherscan
3. **Review Code**: Clean, commented, production-ready
4. **Demo Flow**: Full end-to-end functionality in 2 minutes

---

**Built with ❤️ in 18 hours for hackathon demo**