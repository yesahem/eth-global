import axios from 'axios';
import type { IStorageService } from '../types';
import { config } from '../config';
import { generateContentHash } from '../utils/helpers';
import { LocalBackupService } from './local-backup.service';

export class IPFSStorageService implements IStorageService {
  private backupService = new LocalBackupService();

  async store(content: string): Promise<string> {
    // Try real IPFS first if credentials are available
    if (config.pinata.apiKey && config.pinata.secretKey) {
      console.log('📡 Storing content on IPFS via Pinata...');
      try {
        const response = await axios.post(
          config.pinata.apiUrl,
          {
            pinataContent: { 
              content, 
              timestamp: new Date().toISOString(),
              agent: 'decentralized-memory-layer'
            },
            pinataMetadata: { 
              name: `memory-${Date.now()}`,
              keyvalues: {
                type: 'ai-memory',
                timestamp: new Date().toISOString()
              }
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'pinata_api_key': config.pinata.apiKey,
              'pinata_secret_api_key': config.pinata.secretKey
            },
            timeout: 15000
          }
        );
        
        const ipfsHash = response.data.IpfsHash;
        console.log(`✅ Content stored on IPFS with hash: ${ipfsHash}`);
        
        // Also store locally as backup
        await this.backupService.storeLocalBackup(ipfsHash, content);
        
        return ipfsHash;
      } catch (error) {
        console.error('IPFS storage via Pinata failed:', error);
      }
    }

    // Fallback to local file storage
    console.log('⚠️  Using local file storage as fallback');
    const mockHash = await generateContentHash(content);
    
    await this.backupService.storeLocalBackup(mockHash, content);
    return mockHash;
  }

  async retrieve(hash: string): Promise<string> {
    // Try IPFS if it's a valid hash
    if (hash.startsWith('Qm') && hash.length === 46 && !hash.includes('Mock')) {
      console.log(`📡 Retrieving content from IPFS for hash: ${hash}`);
      try {
        const response = await axios.get(`${config.pinata.gateway}${hash}`, {
          timeout: 10000
        });
        
        let content: string;
        if (typeof response.data === 'string') {
          content = response.data;
        } else if (response.data.content) {
          content = response.data.content;
        } else {
          content = response.data.content || JSON.stringify(response.data);
        }
        
        console.log(`✅ Retrieved content from IPFS for ${hash}`);
        await this.backupService.storeLocalBackup(hash, content);
        
        return content;
      } catch (error) {
        console.log(`⚠️  IPFS retrieval failed for ${hash}, trying local backup`);
      }
    }

    return this.backupService.retrieveLocalBackup(hash);
  }
}