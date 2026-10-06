const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  subscribe,
  unsubscribe,
  getMySubscriptions
} = require("../controllers/subscriptionController");

router.get("/my", protect, getMySubscriptions);

router.post("/", protect, subscribe);

router.delete("/:id", protect, unsubscribe);


module.exports = router;