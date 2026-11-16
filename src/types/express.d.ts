import 'express';

declare global {
  namespace Express {
    interface Request {
      context: { user?: { id: string }; sessionId?: string };
    }
  }
}
