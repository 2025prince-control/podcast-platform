const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1E9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 50 * 1024 * 1024
  },

  fileFilter: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
      file.mimetype.startsWith("audio/") ||
      extension === ".mp3" ||
      extension === ".wav" ||
      extension === ".m4a" ||
      extension === ".ogg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  }
});

module.exports = upload;