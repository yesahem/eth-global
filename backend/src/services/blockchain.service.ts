import { ethers } from 'ethers';
import type { MemoryEntry } from '../types';
import { BlockchainSyncService } from './blockchain-sync.service';
import { BlockchainOperationsService } from './blockchain-operations.service';

export class BlockchainService {
  private syncService: BlockchainSyncService;
  private operationsService: BlockchainOperationsService;

  constructor(
    provider: ethers.JsonRpcProvider | null,
    contract: ethers.Contract | null,
    memoryStore: Map<string, MemoryEntry>,
    agentMemories: Map<string, string[]>
  ) {
    this.syncService = new BlockchainSyncService(provider, contract, memoryStore, agentMemories);
    this.operationsService = new BlockchainOperationsService(provider, contract);
  }

  async syncBlockchainData(): Promise<void> {
    return this.syncService.syncBlockchainData();
  }

  async writeMemoryToBlockchain(hash: string): Promise<void> {
    return this.operationsService.writeMemoryToBlockchain(hash);
  }

  async readMemoriesFromBlockchain(agent: string): Promise<string[] | null> {
    return this.operationsService.readMemoriesFromBlockchain(agent);
  }

  async getMemoryCountFromBlockchain(agent: string): Promise<number | null> {
    return this.operationsService.getMemoryCountFromBlockchain(agent);
  }

  async getNetworkInfo(): Promise<{ chainId: bigint; networkName: string } | null> {
    return this.syncService.getNetworkInfo();
  }
}