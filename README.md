# Decentralized Memory Layer for AI Agents

A hackathon MVP demonstrating a decentralized memory layer for AI agents using the 0G stack and Ethereum Sepolia testnet. This system allows AI agents to store and retrieve memories in a decentralized manner with blockchain-based access control.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │ Smart Contract  │
│   (Next.js)     │◄──►│  (Node.js/Express) │◄──►│  (Solidity)     │
│                 │    │                 │    │                 │
│ • Wallet Connect│    │ • IPFS Storage  │    │ • Memory Refs   │
│ • Write Memory  │    │ • 0G Integration│    │ • Access Control│
│ • Read Memory   │    │ • AI Summary    │    │ • ETH Balance   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                    ┌─────────────────┐
                    │   Storage Layer │
                    │                 │
                    │ • IPFS/Pinata   │
                    │ • 0G Network    │
                    │ • Content Hash  │
                    └─────────────────┘
```

## 🚀 Features

### Smart Contract (MemoryLayer.sol)
- **Memory Storage**: Store memory references (IPFS/0G hashes) on-chain
- **Access Control**: Only wallets with ≥1.5 ETH can read memories
- **Gas Optimized**: Minimal on-chain storage, references to off-chain data
- **Agent Mapping**: Each wallet address can store multiple memories

### Backend Service
- **Storage Integration**: IPFS (Pinata) with 0G fallback capability
- **Blockchain Integration**: Automatic contract interaction
- **AI Summarization**: Periodic memory compression using OpenAI API
- **RESTful API**: Simple endpoints for read/write operations

### Frontend Application
- **Wallet Connection**: MetaMask integration with balance checking
- **Write Interface**: Store memories with real-time feedback
- **Read Interface**: Query memories from any agent address
- **Access Control UI**: Clear indication of balance requirements

## 🛠️ Technology Stack

- **Smart Contracts**: Solidity 0.8.24, Hardhat, OpenZeppelin
- **Backend**: Node.js, Express, Ethers.js, IPFS/Pinata
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Wagmi, Viem
- **Blockchain**: Ethereum Sepolia Testnet
- **Storage**: IPFS (Pinata), 0G Network (planned)
- **AI**: OpenAI API for summarization

## 📋 Prerequisites

- Node.js 18+ or Bun
- MetaMask wallet
- Sepolia testnet ETH (get from faucet)
- IPFS/Pinata API keys
- OpenAI API key (optional, for summarization)

## 🔧 Installation & Setup

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd decentralized-memory-layer

# Install all dependencies
cd contracts && bun install
cd ../backend && bun install  
cd ../frontend && bun install
```

### 2. Environment Configuration

**Contracts (.env)**
```bash
cd contracts
cp .env.example .env
# Edit .env with your values:
# - PRIVATE_KEY: Your wallet private key
# - SEPOLIA_URL: Sepolia RPC URL
# - ETHERSCAN_API_KEY: For contract verification
```

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Edit .env with:
# - CONTRACT_ADDRESS: Deployed contract address
# - PINATA_API_KEY & PINATA_SECRET_KEY
# - OPENAI_API_KEY (optional)
# - Private key for contract interactions
```

**Frontend (.env.local)**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with:
# - NEXT_PUBLIC_CONTRACT_ADDRESS
# - NEXT_PUBLIC_API_URL
```

### 3. Deploy Smart Contract

```bash
cd contracts

# Compile contract
bun run compile

# Deploy to Sepolia
bun run deploy:sepolia

# Verify on Etherscan (optional)
bun run verify <CONTRACT_ADDRESS>
```

### 4. Start Backend Service

```bash
cd backend
bun run dev
# Backend will start on http://localhost:3001
```

### 5. Start Frontend Application

```bash
cd frontend
bun run dev
# Frontend will start on http://localhost:3000
```

## 🎮 Usage

### For Users with ≥1.5 ETH (Full Access)

1. **Connect Wallet**: Click "Connect MetaMask" and approve connection
2. **Write Memory**: Enter memory content and click "Store Memory"
3. **Read Memories**: Enter any agent address to view their memories

### For Users with <1.5 ETH (Write Only)

1. **Connect Wallet**: Connect normally
2. **Write Memory**: Can store memories normally
3. **Read Memories**: Will see "Insufficient Balance" error

## 🧪 Testing

### Contract Tests
```bash
cd contracts
bun run test
```

### Create Test Wallets

1. **Wallet A (Low Balance)**: Create new wallet, send <1.5 ETH
2. **Wallet B (High Balance)**: Create new wallet, send >1.5 ETH
3. Test both scenarios in the frontend

## 📱 Demo Flow

1. **Setup**: Deploy contract, start backend & frontend
2. **Wallet A Test**: Connect with <1.5 ETH → Can write, cannot read
3. **Wallet B Test**: Connect with >1.5 ETH → Can write and read all memories
4. **Cross-Agent Queries**: Use Wallet B to read Wallet A's memories

## 🔗 Deployment URLs

### Smart Contract
- **Sepolia Contract**: `<DEPLOYMENT_ADDRESS>`
- **Etherscan**: `https://sepolia.etherscan.io/address/<ADDRESS>`

### Live Demo
- **Frontend**: `<VERCEL_URL>`
- **Backend**: `<RENDER_URL>`

## 🤝 API Endpoints

### POST `/write`
Store a new memory
```json
{
  "memory": "Learned about React hooks today",
  "agent": "0x..."
}
```

### GET `/read`
Retrieve memories for an agent
```json
{
  "agent": "0x...",
  "reader": "0x..." 
}
```

### GET `/count/:agent`
Get memory count for an agent

## 🔐 Security Considerations

- Private keys in environment variables only
- CORS configured for frontend domain
- Input validation on all endpoints  
- Rate limiting implemented
- Access control enforced on-chain

## 🚨 Known Limitations

- IPFS may have latency for new uploads
- 0G integration requires mainnet deployment
- Summarization requires OpenAI API credits
- Sepolia testnet only for demo

## 🗓️ Development Timeline

Built in **18 hours** for hackathon demo:
- ✅ Smart Contract (2h)
- ✅ Backend API (4h) 
- ✅ Frontend UI (6h)
- ✅ Integration & Testing (3h)
- ✅ Deployment & Demo (3h)

## 📄 License

MIT License - Built for hackathon demonstration purposes.