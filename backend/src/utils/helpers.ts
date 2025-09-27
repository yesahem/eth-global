/**
 * Utility function to retry blockchain operations with exponential backoff
 */
export async function retryBlockchainOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Blockchain operation attempt ${i + 1} failed:`, error instanceof Error ? error.message : error);
      if (i === maxRetries - 1) {
        console.error('All blockchain retry attempts failed');
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
    }
  }
  return null;
}

/**
 * Generate a hash for content using crypto
 */
export async function generateContentHash(content: string): Promise<string> {
  const crypto = await import('crypto');
  return `Qm${crypto.createHash('sha256').update(content).digest('hex').slice(0, 44)}`;
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  try {
    const { ethers } = require('ethers');
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}