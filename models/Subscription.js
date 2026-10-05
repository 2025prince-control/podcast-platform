const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

subscriptionSchema.index(
  { listener: 1, episode: 1 },
  { unique: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);