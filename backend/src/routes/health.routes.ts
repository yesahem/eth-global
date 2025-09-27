import { Router } from 'express';
import type { Request, Response } from 'express';
import type { HealthResponse } from '../types';
import { BlockchainService } from '../services';
import { config, getCurrentRpcUrl } from '../config';

export function createHealthRoutes(blockchainService: BlockchainService): Router {
  const router = Router();

  router.get('/health', async (req: Request, res: Response<HealthResponse>) => {
    try {
      const networkInfo = await blockchainService.getNetworkInfo();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        contract: config.contractAddress ? 'connected' : 'not configured',
        network: networkInfo ? 'connected' : 'not configured'
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        contract: 'not configured',
        network: 'not configured'
      });
    }
  });

  router.get('/status', async (req: Request, res: Response) => {
    try {
      const networkInfo = await blockchainService.getNetworkInfo();
      
      res.json({
        server: 'running',
        timestamp: new Date().toISOString(),
        config: {
          rpcUrl: getCurrentRpcUrl(),
          contract: config.contractAddress || 'not configured',
          network: networkInfo ? `${networkInfo.networkName} (${networkInfo.chainId})` : 'not connected'
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get status' });
    }
  });

  return router;
}