import { Request, Response, NextFunction } from 'express';

export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: any) => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
  };
};