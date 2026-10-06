const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");
const Episode = require("../models/Episode");

const subscribe = async (req, res) => {
  try {
    const { episodeId } = req.body;

    if (!episodeId) {
      return res.status(400).json({
        message: "Episode ID is required"
      });
    }

    const episode = await Episode.findById(episodeId);

    if (!episode) {
      return res.status(404).json({
        message: "Episode not found"
      });
    }

    const existingSubscription = await Subscription.findOne({
      listener: req.user.userId,
      episode: episodeId
    });

    if (existingSubscription) {
      return res.status(200).json({
        message: "Already subscribed to this episode",
        subscription: existingSubscription
      });
    }

    const subscription = await Subscription.create({
      listener: req.user.userId,
      episode: episodeId
    });

    res.status(201).json({
      message: "Subscribed successfully",
      subscription
    });
  } catch (error) {
    res.status(500).json({
      message: "Subscription failed",
      error: error.message
    });
  }
};

const unsubscribe = async (req, res) => {
  try {
    let subscription = null;
    const targetId = req.params.id;

    if (mongoose.Types.ObjectId.isValid(targetId)) {
      subscription = await Subscription.findById(targetId);
      if (!subscription) {
        subscription = await Subscription.findOne({
          episode: targetId,
          listener: req.user.userId
        });
      }
    }

    if (!subscription) {
      return res.status(200).json({
        message: "Unsubscribed successfully"
      });
    }

    if (subscription.listener.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to delete this subscription"
      });
    }

    await Subscription.findByIdAndDelete(subscription._id);

    res.status(200).json({
      message: "Unsubscribed successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Unsubscribe failed",
      error: error.message
    });
  }
};

const getMySubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ listener: req.user.userId });
    res.status(200).json({ subscriptions });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get subscriptions",
      error: error.message
    });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getMySubscriptions
};