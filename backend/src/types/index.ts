export interface MemoryEntry {
  id: string;
  agent: string;
  content: string;
  hash: string;
  timestamp: Date;
  storageType: 'ipfs' | '0g' | 'local';
  storageCid?: string;
}

export interface IStorageService {
  store(content: string): Promise<string>;
  retrieve(hash: string): Promise<string>;
}

export interface MemoryResponse {
  hash: string;
  content: string;
  timestamp: Date;
  storageType: string;
}

export interface WriteMemoryRequest {
  content: string;
  agent: string;
}

export interface ReadMemoryResponse {
  success: boolean;
  memories: MemoryResponse[];
  count: number;
  agent: string;
  reader?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  contract: 'connected' | 'not configured';
  network: 'connected' | 'not configured';
}