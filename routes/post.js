const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  postname: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  url: {
    type: String,
    required: true,
  },
  postPic: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Post", postSchema);
