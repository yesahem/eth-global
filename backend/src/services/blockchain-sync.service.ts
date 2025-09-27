import { ethers } from 'ethers';
import type { MemoryEntry } from '../types';
import { retryBlockchainOperation } from '../utils/helpers';

export class BlockchainSyncService {
  constructor(
    private provider: ethers.JsonRpcProvider | null,
    private contract: ethers.Contract | null,
    private memoryStore: Map<string, MemoryEntry>,
    private agentMemories: Map<string, string[]>
  ) {}

  async syncBlockchainData(): Promise<void> {
    if (!this.contract || !this.provider) {
      console.log('⚠️  Contract not configured, skipping blockchain sync');
      return;
    }

    try {
      console.log('🔄 Syncing blockchain data on startup...');
      
      const filter = this.contract.filters?.MemoryWritten?.();
      if (!filter) {
        console.log('⚠️  MemoryWritten event filter not available');
        return;
      }
      
      // Get events from last 10000 blocks to avoid RPC limits
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000);
      
      console.log(`📡 Querying events from block ${fromBlock} to ${currentBlock}`);
      const events = await this.contract.queryFilter(filter, fromBlock, 'latest');
      
      console.log(`📡 Found ${events.length} memory events on blockchain`);
      
      // Rebuild local storage from blockchain events
      for (const event of events) {
        if ('args' in event && event.args) {
          const agent = event.args.agent as string;
          const memoryHash = event.args.memoryHash as string;
          const timestamp = new Date(Number(event.args.timestamp) * 1000);
        
          // Add to agent memories
          const agentHashes = this.agentMemories.get(agent) || [];
          if (!agentHashes.includes(memoryHash)) {
            agentHashes.push(memoryHash);
            this.agentMemories.set(agent, agentHashes);
          }
          
          // Create memory entry if not exists
          if (!this.memoryStore.has(memoryHash)) {
            const memoryEntry: MemoryEntry = {
              id: `${agent}-${timestamp.getTime()}`,
              agent,
              content: `Memory recovered from blockchain - Hash: ${memoryHash}`,
              hash: memoryHash,
              timestamp,
              storageType: 'ipfs'
            };
            this.memoryStore.set(memoryHash, memoryEntry);
          }
        }
      }
      
      console.log(`✅ Synchronized ${events.length} memories from blockchain`);
      console.log(`📊 Current state: ${this.agentMemories.size} agents, ${this.memoryStore.size} memories`);
      
    } catch (error) {
      console.error('❌ Blockchain sync failed:', error);
    }
  }

  async getNetworkInfo(): Promise<{ chainId: bigint; networkName: string } | null> {
    if (!this.provider) {
      return null;
    }

    try {
      const network = await this.provider.getNetwork();
      const networkName = network.chainId === 9000n ? '0G Testnet' : 
                         network.chainId === 11155111n ? 'Sepolia' : 
                         `Chain ${network.chainId}`;
      
      return { chainId: network.chainId, networkName };
    } catch (error) {
      console.error('Network info fetch failed:', error);
      return null;
    }
  }
}