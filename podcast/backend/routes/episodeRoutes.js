const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createEpisode,
  getEpisodes,
  getEpisode,
  updateEpisode,
  deleteEpisode,
  uploadAudio,
  searchEpisodes
} = require("../controllers/episodeController");

router.get("/search", searchEpisodes);
router.get("/", getEpisodes);

router.get("/:id", getEpisode);

router.post("/", protect, createEpisode);

router.put("/:id", protect, updateEpisode);

router.delete("/:id", protect, deleteEpisode);

router.post(
  "/:id/audio",
  protect,
  upload.single("audio"),
  uploadAudio
);

module.exports = router;