const Episode = require("../models/Episode");

const createEpisode = async (req, res) => {
  try {
    const { title, description, duration, category, audioUrl } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required"
      });
    }

    const episode = await Episode.create({
      title,
      description,
      duration: duration || 0,
      category: category || "General",
      audioUrl: audioUrl || "",
      author: req.user.userId
    });

    res.status(201).json({
      message: "Episode created successfully",
      episode
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create episode",
      error: error.message
    });
  }
};

const getEpisodes = async (req, res) => {
  try {
    const episodes = await Episode.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: episodes.length,
      episodes
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch episodes",
      error: error.message
    });
  }
};

const getEpisode = async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id)
      .populate("author", "name email");

    if (!episode) {
      return res.status(404).json({
        message: "Episode not found"
      });
    }

    res.status(200).json({
      episode
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch episode",
      error: error.message
    });
  }
};

const updateEpisode = async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id);

    if (!episode) {
      return res.status(404).json({
        message: "Episode not found"
      });
    }

    if (episode.author.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to update this episode"
      });
    }

    const updatedEpisode = await Episode.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      message: "Episode updated successfully",
      episode: updatedEpisode
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update episode",
      error: error.message
    });
  }
};

const deleteEpisode = async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id);

    if (!episode) {
      return res.status(404).json({
        message: "Episode not found"
      });
    }

    if (episode.author.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to delete this episode"
      });
    }

    await Episode.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Episode deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete episode",
      error: error.message
    });
  }
};

const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an audio file"
      });
    }

    const episode = await Episode.findById(req.params.id);

    if (!episode) {
      return res.status(404).json({
        message: "Episode not found"
      });
    }

    if (episode.author.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to upload audio for this episode"
      });
    }

    episode.audioUrl = `/uploads/${req.file.filename}`;

    await episode.save();

    res.status(200).json({
      message: "Audio uploaded successfully",
      audioUrl: episode.audioUrl,
      episode
    });

  } catch (error) {
    res.status(500).json({
      message: "Audio upload failed",
      error: error.message
    });
  }
};

const searchEpisodes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        message: "Search query is required"
      });
    }

    const episodes = await Episode.find({
      title: {
        $regex: q,
        $options: "i"
      }
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: episodes.length,
      episodes
    });
  } catch (error) {
    res.status(500).json({
      message: "Search failed",
      error: error.message
    });
  }
};

module.exports = {
  createEpisode,
  getEpisodes,
  getEpisode,
  updateEpisode,
  deleteEpisode,
  uploadAudio,
  searchEpisodes
};