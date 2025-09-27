import { Router } from 'express';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware';
import { validateAgent, validateReader, validateContent } from '../middleware';
import { MemoryService } from '../services';

export function createMemoryRoutes(memoryService: MemoryService): Router {
  const router = Router();

  // Write memory endpoint
  router.post('/write', validateAgent, validateContent, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { content } = req.body;
      const agent = req.agent!;

      const result = await memoryService.writeMemory(content, agent);

      res.json({
        success: true,
        hash: result.hash,
        storageType: result.storageType,
        agent,
        timestamp: result.timestamp
      });

    } catch (error) {
      console.error('Write memory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Read memories endpoint (path parameter)
  router.get('/read/:agent', validateAgent, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const agent = req.agent!;
      const memories = await memoryService.readMemories(agent);

      res.json({
        agent,
        memories,
        count: memories.length
      });

    } catch (error) {
      console.error('Read memory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Read memories endpoint (query parameter for frontend)
  router.get('/read', validateAgent, validateReader, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const agent = req.agent!;
      const reader = req.reader;

      const memories = await memoryService.readMemories(agent);

      res.json({
        success: true,
        memories,
        count: memories.length,
        agent,
        reader
      });

    } catch (error) {
      console.error('Read memory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get agent memory count
  router.get('/count/:agent', validateAgent, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const agent = req.agent!;
      const count = await memoryService.getMemoryCount(agent);

      res.json({ agent, count });

    } catch (error) {
      console.error('Get count error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}