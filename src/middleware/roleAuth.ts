import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.ts";

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    if (!roles.includes(req.dbUser.role)) {
      return res.status(403).json({ error: `Forbidden: Requires one of roles [${roles.join(", ")}]` });
    }

    next();
  };
};
