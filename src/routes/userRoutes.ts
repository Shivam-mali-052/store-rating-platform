import { Router } from "express";
import { User } from "../models/User.ts";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.ts";

const router = Router();

// Basic route to get current user details
router.get("/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.dbUser!;
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to retrieve user profile." });
  }
});

export default router;
