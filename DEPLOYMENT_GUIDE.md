# 🚀 Deployment Guide - Decentralized Memory Layer

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ or Bun installed
- MetaMask wallet with Sepolia testnet configured
- Git for version control

## Step 1: Get Sepolia ETH

1. Visit the Sepolia Faucet: https://sepoliafaucet.com/
2. Connect your MetaMask wallet
3. Request 1-2 ETH (may take a few minutes to arrive)
4. Verify balance in MetaMask > Sepolia Testnet

## Step 2: Setup Environment Variables

### Contracts Configuration
```bash
cd contracts
cp .env.example .env
```

Edit `contracts/.env` with your values:
```env
SEPOLIA_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_actual_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_api_key_optional
```

**⚠️ Important**: Remove the `0x` prefix from your private key

### Get Your Private Key from MetaMask:
1. MetaMask → Click account name → Account Details
2. Export Private Key → Enter password → Copy key
3. Remove `0x` prefix before adding to `.env`

## Step 3: Deploy Smart Contract

```bash
cd contracts
bun run deploy:sepolia
```

**Expected Output:**
```
🚀 Deploying MemoryLayer contract to Sepolia...
📡 Deploying with account: 0x...
💰 Account balance: 2.0 ETH
⛓️  Deploying contract...
✅ MemoryLayer deployed to: 0x8E9141c3C8dA0ABf8D3193Da2c47dc1AF71D5344
🔍 Etherscan: https://sepolia.etherscan.io/address/0x...
🚀 Ready for demo!
```

**📋 Save the contract address** - you'll need it for backend and frontend configuration.

## Step 4: Configure Backend

```bash
cd ../backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3001
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=same_private_key_as_contracts_without_0x
CONTRACT_ADDRESS=0x8E9141c3C8dA0ABf8D3193Da2c47dc1AF71D5344

# Optional: Add these for full IPFS functionality
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
OPENAI_API_KEY=your_openai_api_key
```

## Step 5: Configure Frontend

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x8E9141c3C8dA0ABf8D3193Da2c47dc1AF71D5344
NEXT_PUBLIC_SEPOLIA_CHAIN_ID=11155111
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

## Step 6: Start Services

### Terminal 1 - Backend Service
```bash
cd backend
bun src/server.ts
```

**Expected Output:**
```
🚀 Memory Layer Backend running on port 3001
📡 Network: Sepolia
⛓️  Contract: 0x8E9141c3C8dA0ABf8D3193Da2c47dc1AF71D5344
```

### Terminal 2 - Frontend Application
```bash
cd frontend
bun run dev
```

**Expected Output:**
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
- Network:      http://10.x.x.x:3000
✓ Ready in 994ms
```

## Step 7: Verify Deployment

### Check Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/health
- **Contract**: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

### Test API Endpoints
```bash
# Test write endpoint
curl -X POST http://localhost:3001/write \
  -H "Content-Type: application/json" \
  -d '{"content":"Test memory", "agent":"0x..."}'

# Test read endpoint  
curl "http://localhost:3001/read?agent=0x...&reader=0x..."
```

## Step 8: Demo Testing

### Wallet Scenario A: Low Balance (<1.5 ETH)
1. Create new MetaMask wallet
2. Send 0.5 ETH from faucet
3. Connect to frontend
4. ✅ Should be able to write memories
5. ❌ Should get "Insufficient Balance" when trying to read

### Wallet Scenario B: High Balance (>1.5 ETH)  
1. Use wallet with >1.5 ETH
2. Connect to frontend
3. ✅ Should be able to write memories
4. ✅ Should be able to read all memories (own + others)

## 🎬 Demo Flow (2 minutes)

1. **Show Contract** (30s)
   - Open Etherscan link
   - Show deployed contract and transactions

2. **Connect Wallet A** (30s)
   - Show balance <1.5 ETH
   - Write a memory successfully
   - Try to read → Show access denied

3. **Connect Wallet B** (60s)
   - Show balance >1.5 ETH  
   - Write a memory
   - Read own memories
   - Read Wallet A's memories → Success!

## 🆘 Troubleshooting

### Common Issues:

**"Insufficient funds for gas"**
```bash
# Solution: Get more Sepolia ETH
# Visit: https://sepoliafaucet.com/
```

**"Invalid private key"**
```bash
# Solution: Remove 0x prefix from private key
# Wrong: 0xabcdef123...
# Correct: abcdef123...
```

**"Contract not found"**
```bash
# Solution: Verify contract address in .env files
# Check deployment-info.json for correct address
```

**"CORS error in browser"**
```bash
# Solution: Ensure backend is running on port 3001
# Check frontend .env.local has correct API_URL
```

**"Request timeout"**
```bash
# Solution: Restart backend service
cd backend && bun src/server.ts
```

### Reset Everything:
```bash
# Stop all services (Ctrl+C in both terminals)
# Redeploy contract if needed
cd contracts && bun run deploy:sepolia
# Update .env files with new contract address
# Restart services
```

## 📊 Production Deployment

### Backend (Render/Railway)
```yaml
# Environment Variables:
PORT=10000
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com  
PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=0x...
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SEPOLIA_CHAIN_ID=11155111
```

## ✅ Deployment Checklist

- [ ] Sepolia ETH obtained (>2 ETH recommended)
- [ ] Private key configured (without 0x prefix)
- [ ] Contract deployed successfully
- [ ] Backend .env configured with contract address
- [ ] Frontend .env.local configured
- [ ] Backend service running on port 3001
- [ ] Frontend service running on port 3000
- [ ] Both wallet scenarios tested
- [ ] Demo flow practiced (2 minutes)
- [ ] Video recording ready

## 🎯 Success Metrics

- ✅ Contract verified on Sepolia Etherscan
- ✅ Backend responding to API calls
- ✅ Frontend wallet connection working
- ✅ Write memory: Content stored + blockchain transaction
- ✅ Read memory: Access control enforced (1.5 ETH requirement)
- ✅ Cross-agent queries working
- ✅ 2-minute demo flow smooth

---

**🚀 You're ready for the hackathon demo!**

**Live Demo URLs:**
- Frontend: http://localhost:3000
- Contract: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS