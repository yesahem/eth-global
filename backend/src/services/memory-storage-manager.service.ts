import type { MemoryEntry, MemoryResponse } from '../types';
import { IPFSStorageService } from './ipfs-storage.service';
import { ZeroGStorageService } from './zerog-storage.service';

export class MemoryStorageManager {
  private ipfsStorage = new IPFSStorageService();
  private zeroGStorage = new ZeroGStorageService();

  constructor(
    private memoryStore: Map<string, MemoryEntry>,
    private agentMemories: Map<string, string[]>
  ) {}

  async retrieveMemoryContents(memoryHashes: string[], agent: string): Promise<MemoryResponse[]> {
    const memories: MemoryResponse[] = [];
    
    for (const hash of memoryHashes) {
      try {
        let content: string;
        let timestamp: Date;
        let storageType: string;

        const memoryEntry = this.memoryStore.get(hash);

        if (memoryEntry) {
          content = memoryEntry.content;
          timestamp = memoryEntry.timestamp;
          storageType = memoryEntry.storageType;
        } else {
          console.log(`📦 Retrieving content for hash: ${hash}`);
          
          if (hash.startsWith('0g')) {
            content = await this.zeroGStorage.retrieve(hash);
            storageType = '0g';
          } else {
            content = await this.ipfsStorage.retrieve(hash);
            storageType = 'ipfs';
          }
          
          timestamp = new Date();
          
          // Cache retrieved content
          const recoveredEntry: MemoryEntry = {
            id: `${agent}-${Date.now()}`,
            agent,
            content,
            hash,
            timestamp,
            storageType: storageType as 'ipfs' | '0g' | 'local'
          };
          this.memoryStore.set(hash, recoveredEntry);
        }

        memories.push({
          hash,
          content,
          timestamp,
          storageType
        });
        
      } catch (error) {
        console.error(`Failed to retrieve memory ${hash}:`, error);
        memories.push({
          hash,
          content: 'Failed to retrieve content',
          timestamp: new Date(),
          storageType: 'unknown'
        });
      }
    }

    return memories;
  }

  async storeMemoryContent(content: string): Promise<{
    hash: string;
    storageType: 'local' | 'ipfs' | '0g';
  }> {
    try {
      const hash = await this.ipfsStorage.store(content);
      console.log(`✅ Stored with hash: ${hash}`);
      return { hash, storageType: 'ipfs' };
    } catch (error) {
      console.error('Storage failed:', error);
      const { generateContentHash } = await import('../utils/helpers');
      const hash = await generateContentHash(content);
      console.log(`✅ Generated fallback hash: ${hash}`);
      return { hash, storageType: 'local' };
    }
  }
}