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

    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;