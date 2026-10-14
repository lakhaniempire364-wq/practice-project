const mongoose = require("mongoose");
require("dotenv").config();

let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is not set in environment variables!");
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  if (uri.includes("<db_password>")) {
    console.warn("\n⚠️  [MongoDB] Warning: Your MONGODB_URI still contains '<db_password>'.");
    console.warn("👉 Please set MONGODB_URI in your environment variables with your actual MongoDB Atlas database password.\n");
  }

  try {
    const conn = await mongoose.connect(uri, {
      bufferCommands: false,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
}

module.exports = connectDB;
