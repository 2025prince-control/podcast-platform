const Review = require("../models/Review");
const Episode = require("../models/Episode");

const createReview = async (req, res) => {
  try {
    const { episodeId, rating, comment } = req.body;

    if (!episodeId || !rating || !comment) {
      return res.status(400).json({
        message: "Episode ID, rating and comment are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    const episode = await Episode.findById(episodeId);

    if (!episode) {
      return res.status(404).json({
        message: "Episode not found"
      });
    }

    const review = await Review.create({
      listener: req.user.userId,
      episode: episodeId,
      rating,
      comment
    });

    res.status(201).json({
      message: "Review added successfully",
      review
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add review",
      error: error.message
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("listener", "name email")
      .populate("episode", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};

const getEpisodeReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      episode: req.params.id
    })
      .populate("listener", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch episode reviews",
      error: error.message
    });
  }
};

module.exports = {
  createReview,
  getReviews,
  getEpisodeReviews
};