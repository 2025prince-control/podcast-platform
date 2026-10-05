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
      return res.status(400).json({
        message: "Already subscribed to this episode"
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
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found"
      });
    }

    if (subscription.listener.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to delete this subscription"
      });
    }

    await Subscription.findByIdAndDelete(req.params.id);

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

module.exports = {
  subscribe,
  unsubscribe
};