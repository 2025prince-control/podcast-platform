const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createReview,
  getReviews,
  getEpisodeReviews
} = require("../controllers/reviewController");

router.post("/", protect, createReview);

router.get("/", getReviews);

router.get("/episode/:id", getEpisodeReviews);

module.exports = router;