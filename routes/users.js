const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
const dburl = process.env.MONGO_URL;
// console.log("dburl", dburl);

mongoose.connect(dburl);

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema);
