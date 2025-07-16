import app from "./app";
import dotenv from 'dotenv';
import { prisma } from "../lib/prisma"; // adjust path if needed

dotenv.config({ path: './config.env' });

async function startServer() {
  try {
    // Try a simple query to confirm connection
    await prisma.user.findMany();
    console.log("✅ Connected to the database");
    
    app.listen(3000, () => {
      console.log("🚀 Server is running on http://localhost:3000");
    });
  } catch (err) {
    console.error("❌ Failed to connect to the database:", err);
    process.exit(1); // Stop the server if DB connection fails
  }
}

startServer();
