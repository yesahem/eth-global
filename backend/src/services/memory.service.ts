import type { MemoryEntry, MemoryResponse } from '../types';
import { BlockchainService } from './blockchain.service';
import { MemoryStorageManager } from './memory-storage-manager.service';

export class MemoryService {
  private memoryStore = new Map<string, MemoryEntry>();
  private agentMemories = new Map<string, string[]>();
  private storageManager: MemoryStorageManager;

  constructor(private blockchainService: BlockchainService) {
    this.storageManager = new MemoryStorageManager(this.memoryStore, this.agentMemories);
  }

  getMemoryStore(): Map<string, MemoryEntry> {
    return this.memoryStore;
  }

  getAgentMemories(): Map<string, string[]> {
    return this.agentMemories;
  }

  async writeMemory(content: string, agent: string): Promise<{
    hash: string;
    storageType: 'local' | 'ipfs' | '0g';
    timestamp: Date;
  }> {
    console.log(`📝 Writing memory for agent: ${agent}`);

    const { hash, storageType } = await this.storageManager.storeMemoryContent(content);

    // Store in local memory
    const memoryEntry: MemoryEntry = {
      id: `${agent}-${Date.now()}`,
      agent,
      content,
      hash,
      timestamp: new Date(),
      storageType
    };

    this.memoryStore.set(hash, memoryEntry);

    // Update agent's memory list
    const agentHashes = this.agentMemories.get(agent) || [];
    agentHashes.push(hash);
    this.agentMemories.set(agent, agentHashes);

    // Write to blockchain (non-blocking)
    this.blockchainService.writeMemoryToBlockchain(hash).catch(error => {
      console.error('Blockchain write failed:', error);
    });

    return {
      hash,
      storageType,
      timestamp: memoryEntry.timestamp
    };
  }

  async readMemories(agent: string): Promise<MemoryResponse[]> {
    console.log(`📖 Reading memories for agent: ${agent}`);

    let memoryHashes: string[] = [];

    // Try blockchain first
    const blockchainHashes = await this.blockchainService.readMemoriesFromBlockchain(agent);
    
    if (blockchainHashes) {
      memoryHashes = blockchainHashes;
      console.log(`📡 Found ${memoryHashes.length} memory hashes on blockchain`);
    } else {
      console.log('⚠️  Blockchain read failed, using local storage');
      memoryHashes = this.agentMemories.get(agent) || [];
    }

    if (memoryHashes.length === 0) {
      return [];
    }

    return this.storageManager.retrieveMemoryContents(memoryHashes, agent);
  }

  async getMemoryCount(agent: string): Promise<number> {
    // Try blockchain first
    const blockchainCount = await this.blockchainService.getMemoryCountFromBlockchain(agent);
    
    if (blockchainCount !== null) {
      return blockchainCount;
    }

    // Fallback to local count
    return (this.agentMemories.get(agent) || []).length;
  }
}