const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/web-novel/");
  },
  filename: function (req, file, cb) {
    const uniqueFilename = uuidv4();
    cb(null, uniqueFilename + path.extname(file.originalname));
  },
});

const upload_webnovel = multer({ storage: storage });

module.exports = upload_webnovel;
