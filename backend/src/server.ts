import app from "./app";
import dotenv from 'dotenv';
import { prisma } from "../lib/prisma"; // adjust path if needed
import express from "express";
import path from "path";
import { getRedis } from "../config/redis";

dotenv.config({ path: './config.env' });

app.use(express.static(path.join(__dirname, 'public')));

// Increase max listeners to prevent memory leak warnings
process.setMaxListeners(20);

async function startServer() {
  try {
    // Try a simple query to confirm connection
    await prisma.user.findMany();
    console.log(`✅ Connected to the database ${process.env.DATABASE_URL}`);

    try {
      await getRedis();
      console.log("✅ Connected to Redis");
    } catch (redisError) {
      console.error("⚠️ Redis connection failed:", redisError);
    }

    app.listen(8000, () => {
      console.log("🚀 Server is running on http://localhost:8000");
    });
  } catch (err) {
    console.error("❌ Failed to connect to the database:", err);
    process.exit(1); // Stop the server if DB connection fails
  }
}

startServer();