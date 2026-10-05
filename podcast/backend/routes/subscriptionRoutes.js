const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  subscribe,
  unsubscribe
} = require("../controllers/subscriptionController");


router.post("/", protect, subscribe);

router.delete("/:id", protect, unsubscribe);


module.exports = router;