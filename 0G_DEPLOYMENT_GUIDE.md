# 0G Testnet Deployment Documentation

## Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- MetaMask with custom network support
- 0G testnet tokens in wallet

### Environment Setup
Create `.env` file in contracts directory:
```bash
ZG_RPC_URL=https://evmrpc-testnet.0g.ai
PRIVATE_KEY=your_private_key_here
```

### Deploy Commands
```bash
# Enhanced deployment (recommended)
npm run deploy:0g

# Quick deployment
npm run deploy:0g:quick
```

## Network Configuration

### 0G Testnet Details
- **Name**: 0G Testnet
- **Chain ID**: 9000
- **RPC URL**: https://evmrpc-testnet.0g.ai
- **Currency**: 0G
- **Gas Price**: 20 Gwei
- **Block Explorer**: TBA

### MetaMask Setup
Add 0G testnet to MetaMask:
1. Open MetaMask > Networks > Add Network
2. Fill in the network details above
3. Save and switch to 0G testnet

## Deployment Scripts

### Enhanced Deployment Script
Location: `scripts/deploy-0g-enhanced.js`

**Features:**
- Complete environment validation
- Network connectivity verification
- Wallet balance checks
- Gas estimation
- Comprehensive error handling
- Post-deployment testing
- Configuration file generation
- Detailed logging

**Process Flow:**
1. Validate environment variables
2. Check network connectivity
3. Verify wallet balance
4. Estimate deployment gas
5. Deploy library contracts
6. Deploy main MemoryLayer contract
7. Test deployed contracts
8. Generate configuration files
9. Provide next steps

### Quick Deployment Script
Location: `scripts/deploy-0g-quick.js`

**Features:**
- Minimal deployment process
- Basic error handling
- Fast deployment for testing
- Simple logging

**Use Cases:**
- Rapid prototyping
- Development testing
- CI/CD pipelines

## Generated Files

### deployment-config.json
Complete deployment information including:
- Network details
- Contract addresses
- Transaction hashes
- Deployment timestamp
- Gas usage statistics

### .env Updates
Automatic addition of:
- Contract addresses
- Network configuration
- Deployment metadata

## Integration Guide

### Backend Integration
Update backend `.env` with contract addresses:
```bash
MEMORY_LAYER_ADDRESS=0x...
MEMORY_ACCESS_CONTROL_ADDRESS=0x...
MEMORY_STORAGE_ADDRESS=0x...
MEMORY_ECONOMICS_ADDRESS=0x...
```

### Frontend Integration
Configure Web3 provider for 0G testnet:
```javascript
const provider = new ethers.providers.JsonRpcProvider(
  'https://evmrpc-testnet.0g.ai'
);

const contract = new ethers.Contract(
  process.env.MEMORY_LAYER_ADDRESS,
  abi,
  provider
);
```

## Troubleshooting

### Common Issues

**Insufficient Balance**
- Ensure wallet has enough 0G tokens
- Request tokens from faucet
- Check gas price settings

**Network Connection**
- Verify RPC URL accessibility
- Check internet connection
- Try alternative RPC endpoints

**Deployment Failures**
- Review gas estimation
- Check contract compilation
- Verify constructor parameters

### Debug Mode
Enable detailed logging:
```bash
DEBUG=true npm run deploy:0g
```

### Manual Verification
Test deployment manually:
```bash
hardhat console --network zgtestnet
> const contract = await ethers.getContractAt("MemoryLayer", "0x...")
> await contract.owner()
```

## Security Best Practices

### Private Key Management
- Use hardware wallets for production
- Never commit private keys
- Rotate keys regularly
- Use environment variables

### Deployment Security
- Test on testnet first
- Use proxy patterns for upgrades
- Implement proper access controls
- Audit contracts before mainnet

### Operational Security
- Multi-signature for mainnet deployments
- Regular security updates
- Monitor contract activity
- Backup deployment configurations

## Support Resources

### Documentation
- 0G Network docs: [Link TBA]
- Hardhat documentation: https://hardhat.org/docs
- Ethers.js documentation: https://docs.ethers.io

### Community
- 0G Discord: [Link TBA]
- GitHub Issues: Create issues for problems
- Telegram: [Link TBA]

### Emergency Procedures
1. Check deployment logs first
2. Review this documentation
3. Search existing issues
4. Create detailed issue report
5. Contact support channels

---

*For more detailed information, see the main DEPLOYMENT_GUIDE.md*