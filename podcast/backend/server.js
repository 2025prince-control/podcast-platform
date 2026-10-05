const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const episodeRoutes = require("./routes/episodeRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

dotenv.config();
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/episodes", episodeRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);

const frontendDistPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendDistPath));

app.use((req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
    if (err) {
      res.status(200).json({
        message: "Podcast Platform API is running"
      });
    }
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});