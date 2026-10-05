const Episode = require("../models/Episode");
const Review = require("../models/Review");
const Subscription = require("../models/Subscription");

const getAnalytics = async (req, res) => {
  try {
    const totalEpisodes = await Episode.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalSubscriptions = await Subscription.countDocuments();

    const averageRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    res.status(200).json({
      totalEpisodes,
      totalReviews,
      totalSubscriptions,
      averageRating:
        averageRating.length > 0
          ? Number(averageRating[0].averageRating.toFixed(2))
          : 0
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
};

const getEpisodeAnalytics = async (req, res) => {
  try {
    const episodeId = req.params.id;

    const episode = await Episode.findById(episodeId);

    if (!episode) {
      return res.status(404).json({
        message: "Episode not found"
      });
    }

    const reviewCount = await Review.countDocuments({
      episode: episodeId
    });

    const subscriptionCount = await Subscription.countDocuments({
      episode: episodeId
    });

    const ratingData = await Review.aggregate([
      {
        $match: {
          episode: episode._id
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    res.status(200).json({
      episode: {
        id: episode._id,
        title: episode.title,
        category: episode.category
      },
      reviews: reviewCount,
      subscriptions: subscriptionCount,
      averageRating:
        ratingData.length > 0
          ? Number(ratingData[0].averageRating.toFixed(2))
          : 0
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch episode analytics",
      error: error.message
    });
  }
};

module.exports = {
  getAnalytics,
  getEpisodeAnalytics
};