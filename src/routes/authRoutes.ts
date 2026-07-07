import { Router, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.ts";
import { Store } from "../models/Store.ts";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.ts";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateAddress,
} from "../utils/validation.ts";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-2026";

// Register endpoint
router.post("/register", async (req, res) => {
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

    // Check if user already exists
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

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message || "Failed to register user." });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const canonicalEmail = email.toLowerCase();

    const user = await User.findOne({ where: { email: canonicalEmail } });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Failed to login." });
  }
});

// Change password endpoint
router.put("/change-password", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Old password and new password are required." });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      error: "Password must be 8-16 characters and contain at least one uppercase letter and one special character.",
    });
  }

  try {
    const user = req.dbUser!;

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error: any) {
    console.error("Change password error:", error);
    res.status(500).json({ error: error.message || "Failed to change password." });
  }
});

// Get profile me
router.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.dbUser!;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

// Update password directly using authenticated session
router.put("/update-password", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: "New password is required." });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      error: "Password must be 8-16 characters and contain at least one uppercase letter and one special character.",
    });
  }

  try {
    const user = req.dbUser!;
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error: any) {
    console.error("Update password error:", error);
    res.status(500).json({ error: error.message || "Failed to update password." });
  }
});

export default router;
