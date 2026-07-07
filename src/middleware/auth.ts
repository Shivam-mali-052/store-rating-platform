import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.ts";

export interface AuthenticatedRequest extends Request {
  user?: any; // Decoded JWT payload
  dbUser?: User; // Sequelize User record
}

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-2026";

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing authorization header" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    req.user = decoded;

    // Fetch user from PostgreSQL DB via Sequelize
    const dbUser = await User.findByPk(decoded.id);
    if (!dbUser) {
      return res.status(401).json({ error: "Unauthorized: User no longer exists" });
    }

    req.dbUser = dbUser;
    next();
  } catch (error: any) {
    console.error("Error in requireAuth middleware:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};
