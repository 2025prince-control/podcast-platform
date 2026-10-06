const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || "";
    const uri = rawUri.trim().replace(/^["']|["']$/g, "").trim();

    if (!uri) {
      throw new Error("MONGO_URI environment variable is missing or empty.");
    }

    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      throw new Error(
        `MONGO_URI must start with "mongodb://" or "mongodb+srv://". Received: "${uri.substring(0, 20)}..."`
      );
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    if (error.message.includes("whitelist") || error.message.includes("SSL") || error.message.includes("querySrv")) {
      console.error("\n========================================================");
      console.error("  ACTION NEEDED FOR MONGODB ATLAS:");
      console.error("  Your local IP address is not whitelisted in MongoDB Atlas.");
      console.error("  1. Log in to https://cloud.mongodb.com");
      console.error("  2. Navigate to 'Network Access' -> 'Add IP Address'");
      console.error("  3. Click 'Allow Access From Anywhere' (0.0.0.0/0) or add your current IP");
      console.error("========================================================\n");
    }
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    } else {
      console.warn("⚠️ Server running in local dev mode. MongoDB will connect once IP is whitelisted in Atlas.");
    }
  }
};

module.exports = connectDB;