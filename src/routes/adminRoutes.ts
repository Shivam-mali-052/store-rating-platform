import { Router } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.ts";
import { Store } from "../models/Store.ts";
import { Rating } from "../models/Rating.ts";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.ts";
import { requireRole } from "../middleware/roleAuth.ts";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateAddress,
} from "../utils/validation.ts";

const router = Router();

// Stats Dashboard
router.get("/stats", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  try {
    const totalUsers = await User.count({
      where: {
        role: ["user", "admin"],
      },
    });

    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error: any) {
    console.error("Failed to fetch admin stats:", error);
    res.status(500).json({ error: error.message || "Failed to load admin stats." });
  }
});

// All Users/Stores with sorting and filtering
router.get("/users", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  try {
    const { search, role, sortBy, sortOrder } = req.query;

    const allUsers = await User.findAll();
    const allStores = await Store.findAll();
    const allRatings = await Rating.findAll();

    // Consolidate list
    let results: any[] = [];

    for (const u of allUsers) {
      if (u.role === "store_owner") {
        const store = allStores.find((s) => s.ownerId === u.id);
        let averageRating = 0;
        let storeId = null;
        let storeName = u.name;
        let storeAddress = u.address;
        let storeEmail = u.email;

        if (store) {
          storeId = store.id;
          storeName = store.name;
          storeAddress = store.address;
          storeEmail = store.email;

          const storeRatings = allRatings.filter((r) => r.storeId === store.id);
          const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
          averageRating = storeRatings.length > 0 ? Number((sum / storeRatings.length).toFixed(2)) : 0;
        }

        results.push({
          id: u.id,
          name: storeName,
          email: storeEmail,
          address: storeAddress,
          role: u.role,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          storeId,
          averageRating,
        });
      } else {
        results.push({
          id: u.id,
          name: u.name,
          email: u.email,
          address: u.address,
          role: u.role,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        });
      }
    }

    // Filtering
    if (role) {
      results = results.filter((item) => item.role === role);
    }

    if (search) {
      const query = (search as string).toLowerCase();
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query) ||
          item.address.toLowerCase().includes(query)
      );
    }

    // Sorting
    if (sortBy) {
      const sBy = sortBy as string;
      const sOrder = sortOrder === "desc" ? "desc" : "asc";

      results.sort((a: any, b: any) => {
        let valA = sBy === "rating" ? a.averageRating || 0 : a[sBy];
        let valB = sBy === "rating" ? b.averageRating || 0 : b[sBy];

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
    console.error("Failed to fetch user listings:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve user listings." });
  }
});

// Create User
router.post("/users", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  const { name, email, password, address, role } = req.body;

  if (!name || !email || !password || !address || !role) {
    return res.status(400).json({ error: "All fields are required (Name, Email, Password, Address, Role)." });
  }

  if (!["admin", "user", "store_owner"].includes(role)) {
    return res.status(400).json({ error: "Invalid role specified." });
  }

  if (!validateName(name)) {
    return res.status(400).json({ error: "Name must be min 20 and max 60 characters." });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid Email address format." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      error: "Password must be 8-16 characters and contain at least one uppercase letter and one special character.",
    });
  }

  if (!validateAddress(address)) {
    return res.status(400).json({ error: "Address must be at most 400 characters." });
  }

  try {
    const canonicalEmail = email.toLowerCase();

    // Check email exists
    const existingUser = await User.findOne({ where: { email: canonicalEmail } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists in the system." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: canonicalEmail,
      password: hashedPassword,
      address,
      role,
    });

    // If role is store_owner, create corresponding Store
    if (role === "store_owner") {
      await Store.create({
        name,
        email: canonicalEmail,
        address,
        ownerId: user.id,
      });
    }

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error: any) {
    console.error("Error creating user via admin:", error);
    res.status(500).json({ error: error.message || "Failed to create user." });
  }
});

export default router;
