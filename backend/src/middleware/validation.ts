import type { Request, Response, NextFunction } from 'express';
import { isValidAddress } from '../utils/helpers';

export interface AuthenticatedRequest extends Request {
  agent?: string;
  reader?: string;
}

export function validateAgent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const agent = req.body?.agent || req.params?.agent || req.query?.agent;
  
  if (!agent) {
    return res.status(400).json({ error: 'Agent address is required' });
  }
  
  if (!isValidAddress(agent as string)) {
    return res.status(400).json({ error: 'Invalid agent address' });
  }
  
  req.agent = agent as string;
  next();
}

export function validateReader(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const reader = req.query?.reader;
  
  if (reader && !isValidAddress(reader as string)) {
    return res.status(400).json({ error: 'Invalid reader address' });
  }
  
  req.reader = reader as string;
  next();
}

export function validateContent(req: Request, res: Response, next: NextFunction) {
  const { content } = req.body;
  
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
  }
  
  next();
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled error:', err);
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}