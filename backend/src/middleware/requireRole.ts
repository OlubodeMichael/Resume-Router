// middleware/requireRole.ts
import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";

type UserRole = "USER" | "ADMIN" | "MODERATOR";

interface AuthenticatedRequest extends Request {
  user: User & { role: UserRole };
}

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user || !authReq.user.role || !roles.includes(authReq.user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    
    next();
  };
};