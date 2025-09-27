export class LocalBackupService {
  async storeLocalBackup(hash: string, content: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const storageDir = path.join(process.cwd(), '.storage');
      
      await fs.mkdir(storageDir, { recursive: true });
      
      const filePath = path.join(storageDir, `${hash}.txt`);
      const metadata = {
        hash,
        content,
        timestamp: new Date().toISOString(),
        storageType: hash.startsWith('Qm') && hash.length === 46 ? 'ipfs' : 'local'
      };
      
      await fs.writeFile(filePath, JSON.stringify(metadata, null, 2), 'utf-8');
      console.log(`📁 Backup stored locally at ${filePath}`);
    } catch (error) {
      console.error('Local backup storage failed:', error);
    }
  }

  async retrieveLocalBackup(hash: string): Promise<string> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const storageDir = path.join(process.cwd(), '.storage');
      const filePath = path.join(storageDir, `${hash}.txt`);
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      console.log(`📁 Retrieved content from local backup for ${hash}`);
      
      try {
        const metadata = JSON.parse(fileContent);
        return metadata.content || fileContent;
      } catch {
        return fileContent;
      }
    } catch (error) {
      console.log(`⚠️  Local backup read failed for ${hash}`);
      return this.getErrorMessage(hash);
    }
  }

  private getErrorMessage(hash: string): string {
    if (hash.startsWith('Qm') && hash.length === 45) {
      return `[Legacy Memory - Hash: ${hash}]\n\nThis memory was created with the previous storage system and the original content is no longer available.`;
    } else if (hash.startsWith('Qm') && hash.length === 46) {
      return `[IPFS Content Unavailable - Hash: ${hash}]\n\nThis content should be available on IPFS but couldn't be retrieved.`;
    } else {
      return `[Content not available - Hash: ${hash}]\n\nContent could not be retrieved from storage.`;
    }
  }
}