import express from "express";
import path from "path";
import * as dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { sequelize } from "./src/config/database.ts";
import { User } from "./src/models/User.ts";
import bcrypt from "bcrypt";

import authRoutes from "./src/routes/authRoutes.ts";
import adminRoutes from "./src/routes/adminRoutes.ts";
import storeRoutes from "./src/routes/storeRoutes.ts";
import ratingRoutes from "./src/routes/ratingRoutes.ts";
import userRoutes from "./src/routes/userRoutes.ts";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize and Sync Database
  try {
    console.log("Database connection authenticating...");
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    
    // Create tables automatically (and alter them if there are minor changes)
    await sequelize.sync({ alter: true });
    console.log("Database models synchronized successfully.");

    // Seed default admin
    const defaultAdminEmail = "admin@store.com";
    const existingAdmin = await User.findOne({ where: { email: defaultAdminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      await User.create({
        name: "System Administrator",
        email: defaultAdminEmail,
        password: hashedPassword,
        address: "System HQ, Main Street",
        role: "admin",
      });
      console.log("Default admin user seeded successfully.");
    }
  } catch (error) {
    console.error("Database initialization failed:", error);
  }

  // --- API ROUTES ---
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api", storeRoutes);
  app.use("/api", ratingRoutes);
  app.use("/api/users", userRoutes);

  // --- VITE AND STATIC ASSET SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
