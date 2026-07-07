import { Router } from "express";
import { User } from "../models/User.ts";
import { Store } from "../models/Store.ts";
import { Rating } from "../models/Rating.ts";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.ts";
import { requireRole } from "../middleware/roleAuth.ts";

const router = Router();

// Normal User - Registered Stores List
router.get("/stores", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { search, sortBy, sortOrder } = req.query;
    const loggedInUserId = req.dbUser!.id;

    const allStores = await Store.findAll();
    const allRatings = await Rating.findAll();

    let results = allStores.map((s) => {
      const storeRatings = allRatings.filter((r) => r.storeId === s.id);
      const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
      const overallRating = storeRatings.length > 0 ? Number((sum / storeRatings.length).toFixed(2)) : 0;

      // Find user rating
      const userSubmittedRating = storeRatings.find((r) => r.userId === loggedInUserId)?.rating || 0;

      return {
        id: s.id,
        name: s.name,
        address: s.address,
        email: s.email,
        overallRating,
        userRating: userSubmittedRating,
      };
    });

    // Filtering
    if (search) {
      const query = (search as string).toLowerCase();
      results = results.filter(
        (s) => s.name.toLowerCase().includes(query) || s.address.toLowerCase().includes(query)
      );
    }

    // Sorting
    if (sortBy) {
      const sBy = sortBy as string;
      const sOrder = sortOrder === "desc" ? "desc" : "asc";

      results.sort((a: any, b: any) => {
        let valA = a[sBy];
        let valB = b[sBy];

        if (valA === undefined || valA === null) valA = "";
        if (valB === undefined || valB === null) valB = "";

        if (typeof valA === "string" && typeof valB === "string") {
          return sOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          if (valA === valB) return 0;
          return sOrder === "asc" ? (valA > valB ? 1 : -1) : (valB > valA ? 1 : -1);
        }
      });
    }

    res.json(results);
  } catch (error: any) {
    console.error("Failed to load stores for user:", error);
    res.status(500).json({ error: error.message || "Failed to load stores." });
  }
});

// Store Owner - Stats Dashboard
router.get("/store-owner/dashboard", requireAuth, requireRole(["store_owner"]), async (req: AuthenticatedRequest, res) => {
  try {
    const { sortBy, sortOrder } = req.query;
    const storeOwnerUserId = req.dbUser!.id;

    // Find the store owned by this user
    const store = await Store.findOne({ where: { ownerId: storeOwnerUserId } });
    if (!store) {
      return res.status(404).json({ error: "No store found for this store owner." });
    }

    const allUsers = await User.findAll();
    const storeRatings = await Rating.findAll({ where: { storeId: store.id } });

    const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = storeRatings.length > 0 ? Number((sum / storeRatings.length).toFixed(2)) : 0;

    // List of users who submitted ratings for this store
    const ratingsList = storeRatings.map((r) => {
      const user = allUsers.find((u) => u.id === r.userId);
      return {
        id: r.id,
        userName: user?.name || "Deleted User",
        userEmail: user?.email || "N/A",
        userAddress: user?.address || "N/A",
        rating: r.rating,
        date: r.updatedAt || r.createdAt,
      };
    });

    // Sorting ratingsList
    if (sortBy) {
      const sBy = sortBy as string;
      const sOrder = sortOrder === "desc" ? "desc" : "asc";

      ratingsList.sort((a: any, b: any) => {
        let valA = a[sBy];
        let valB = b[sBy];

        if (valA === undefined || valA === null) valA = "";
        if (valB === undefined || valB === null) valB = "";

        if (typeof valA === "string" && typeof valB === "string") {
          return sOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          if (valA === valB) return 0;
          return sOrder === "asc" ? (valA > valB ? 1 : -1) : (valB > valA ? 1 : -1);
        }
      });
    }

    res.json({
      storeName: store.name,
      storeAddress: store.address,
      averageRating,
      ratingsList,
    });
  } catch (error: any) {
    console.error("Failed to load store owner dashboard:", error);
    res.status(500).json({ error: error.message || "Failed to load dashboard." });
  }
});

export default router;
