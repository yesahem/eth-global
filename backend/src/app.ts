import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { config, initializeBlockchain, getCurrentRpcUrl } from './config';
import { errorHandler } from './middleware';
import { BlockchainService, MemoryService } from './services';
import { createMemoryRoutes, createHealthRoutes } from './routes';

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize blockchain connection
const { provider, wallet, contract } = initializeBlockchain();

// Initialize services
const memoryStore = new Map();
const agentMemories = new Map();
const blockchainService = new BlockchainService(provider, contract, memoryStore, agentMemories);
const memoryService = new MemoryService(blockchainService);

// Update service references
Object.assign(blockchainService, {
  memoryStore: memoryService.getMemoryStore(),
  agentMemories: memoryService.getAgentMemories()
});

// Routes
app.use('/', createHealthRoutes(blockchainService));
app.use('/', createMemoryRoutes(memoryService));

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.port, async () => {
  console.log(`🚀 Memory Layer Backend running on port ${config.port}`);
  
  if (provider) {
    const networkInfo = await blockchainService.getNetworkInfo();
    if (networkInfo) {
      console.log(`📡 Network: ${networkInfo.networkName} (Chain ID: ${networkInfo.chainId})`);
    }
    console.log(`🔗 RPC URL: ${getCurrentRpcUrl()}`);
  } else {
    console.log(`📡 Network: Local only`);
  }
  
  console.log(`⛓️  Contract: ${config.contractAddress || 'Not configured'}`);
  console.log('🔄 Backend started - blockchain data will be fetched on-demand');
});

export default app;