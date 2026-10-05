const express = require("express");
const router = express.Router();

const {
  getAnalytics,
  getEpisodeAnalytics
} = require("../controllers/analyticsController");

router.get("/", getAnalytics);
router.get("/episode/:id", getEpisodeAnalytics);

module.exports = router;