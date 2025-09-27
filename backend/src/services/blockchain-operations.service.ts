import type { MemoryEntry } from '../types';
import { retryBlockchainOperation } from '../utils/helpers';
import { ethers } from 'ethers';

export class BlockchainOperationsService {
  constructor(
    private provider: ethers.JsonRpcProvider | null,
    private contract: ethers.Contract | null
  ) {}

  async writeMemoryToBlockchain(hash: string): Promise<void> {
    if (!this.contract?.writeMemory) {
      console.log('⚠️  Contract not available for blockchain write');
      return;
    }

    try {
      console.log(`⛓️  Writing to blockchain contract...`);
      const tx = await this.contract.writeMemory(hash);
      console.log(`Transaction hash: ${tx.hash}`);
      await tx.wait(1);
      console.log(`✅ Memory written to blockchain!`);
    } catch (error) {
      console.error('Blockchain write failed:', error);
      throw error;
    }
  }

  async readMemoriesFromBlockchain(agent: string): Promise<string[] | null> {
    if (!this.contract?.readMemory) {
      return null;
    }

    return await retryBlockchainOperation(async () => {
      if (!this.contract?.readMemory) throw new Error('Contract not available');
      return await this.contract.readMemory(agent);
    });
  }

  async getMemoryCountFromBlockchain(agent: string): Promise<number | null> {
    if (!this.contract?.getMemoryCount) {
      return null;
    }

    try {
      return Number(await this.contract.getMemoryCount(agent));
    } catch (error) {
      console.error('Blockchain count read failed:', error);
      return null;
    }
  }
}