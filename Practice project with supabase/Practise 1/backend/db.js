const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is not set in backend/.env!");
    return;
  }

  if (uri.includes("<db_password>")) {
    console.warn("\n⚠️  ===============================================================");
    console.warn("⚠️  [MongoDB] Notice: Your MONGODB_URI contains '<db_password>'.");
    console.warn("👉 Please open backend/.env and replace '<db_password>' with your actual MongoDB Atlas database password.");
    console.warn("⚠️  ===============================================================\n");
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
      console.error("👉 Please ensure you replaced '<db_password>' in backend/.env with your real password.");
    }
  }
}

module.exports = connectDB;
