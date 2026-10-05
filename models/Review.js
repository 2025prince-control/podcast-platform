const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    listener: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    episode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Episode",
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Review", reviewSchema);