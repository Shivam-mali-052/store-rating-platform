import { Router } from "express";
import { Store } from "../models/Store.ts";
import { Rating } from "../models/Rating.ts";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.ts";
import { requireRole } from "../middleware/roleAuth.ts";

const router = Router();

// Submit or Modify Rating for store
router.post("/stores/:id/rating", requireAuth, requireRole(["user"]), async (req: AuthenticatedRequest, res) => {
  const storeId = Number(req.params.id);
  const { rating } = req.body;

  if (isNaN(storeId)) {
    return res.status(400).json({ error: "Invalid store identifier." });
  }

  const rNum = Number(rating);
  if (isNaN(rNum) || rNum < 1 || rNum > 5 || !Number.isInteger(rNum)) {
    return res.status(400).json({ error: "Rating score must be an integer between 1 and 5." });
  }

  try {
    const userId = req.dbUser!.id;

    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ error: "Target store is not registered in the system." });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      where: {
        userId,
        storeId,
      },
    });

    if (existingRating) {
      // Update
      existingRating.rating = rNum;
      await existingRating.save();
    } else {
      // Create new
      await Rating.create({
        userId,
        storeId,
        rating: rNum,
      });
    }

    res.json({ message: "Rating submitted successfully." });
  } catch (error: any) {
    console.error("Failed to submit or modify rating:", error);
    res.status(500).json({ error: error.message || "Failed to submit rating." });
  }
});

export default router;
