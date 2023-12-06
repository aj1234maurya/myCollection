var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");
const upload_webtoon = require("./multer2");
const upload_webnovel = require("./multer3");
const upload_anime = require("./multer4");
const fs = require("fs");
const path = require("path");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/login", function (req, res, next) {
  res.render("login", { err: req.flash("error") });
});

router.get("/home", function (req, res, next) {
  res.render("home");
});

router.get("/profile", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("profile", { user });
});

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(404).send("No Files were Uploaded");
  }
  const user = await userModel.findOne({ username: req.session.passport.user });
  const postData = await postModel.create({
    postPic: req.file.filename,
    url: req.body.url,
    postname: req.body.postname,
    user: user._id,
    type: req.body.postType,
  });
  user.posts.push(postData._id);
  await user.save();
  res.redirect("/manhwa");
});

router.post(
  "/upload_webtoon",
  upload_webtoon.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(404).send("No Files were Uploaded");
    }
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const postData = await postModel.create({
      postPic: req.file.filename,
      url: req.body.url,
      postname: req.body.postname,
      user: user._id,
      type: req.body.postType,
    });
    user.posts.push(postData._id);
    await user.save();
    res.redirect("/webtoon");
  }
);

router.post(
  "/upload_webnovel",
  upload_webnovel.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(404).send("No Files were Uploaded");
    }
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const postData = await postModel.create({
      postPic: req.file.filename,
      url: req.body.url,
      postname: req.body.postname,
      user: user._id,
      type: req.body.postType,
    });
    user.posts.push(postData._id);
    await user.save();
    res.redirect("/web-novel");
  }
);

router.post("/upload_anime", upload_anime.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(404).send("No Files were Uploaded");
  }
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const postData = await postModel.create({
    postPic: req.file.filename,
    url: req.body.url,
    postname: req.body.postname,
    user: user._id,
    type: req.body.postType,
  });
  user.posts.push(postData._id);
  await user.save();
  res.redirect("/anime");
});

router.get("/manhwa", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate({
      path: "posts",
      match: { type: "manhwa" },
    });
  // console.log(user);
  res.render("manhwa", { user });
});

router.get("/webtoon", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate({
      path: "posts",
      match: { type: "webtoon" },
    });
  // console.log(user);
  res.render("webtoon", { user });
});

router.get("/web-novel", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate({
      path: "posts",
      match: { type: "web-novel" },
    });
  // console.log(user);
  res.render("web-novel", { user });
});

router.get("/anime", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate({
      path: "posts",
      match: { type: "anime" },
    });
  // console.log(user);
  res.render("anime", { user });
});

router.post("/delete/:postId", isLoggedIn, async function (req, res) {
  try {
    const postId = req.params.postId;
    const post = await postModel.findById(postId);
    //console.log(req);
    if (!post) {
      return res.status(404).send("Post Not Found");
    }
    // console.log(post);
    // console.log(post.user.toString());
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }
    const user = await userModel.findById(req.user._id);
    user.posts.pull(postId);
    await user.save();

    let imagePath;

    // Assign the correct path based on the post type
    if (post.type === "manhwa") {
      imagePath = path.join(__dirname, "../public/images/manhwa", post.postPic);
    } else if (post.type === "webtoon") {
      imagePath = path.join(
        __dirname,
        "../public/images/webtoon",
        post.postPic
      );
    } else if (post.type === "web-novel") {
      imagePath = path.join(
        __dirname,
        "../public/images/web-novel",
        post.postPic
      );
    } else if (post.type === "anime") {
      imagePath = path.join(__dirname, "../public/images/anime", post.postPic);
    } else {
      return res.status(500).send("Internal Server Error: Unknown post type");
    }

    await postModel.deleteOne({ _id: postId });
    // await post.remove();
    fs.unlinkSync(imagePath);

    if (post.type === "manhwa") {
      res.redirect(`/manhwa`);
    } else if (post.type === "webtoon") {
      res.redirect(`/webtoon`);
    } else if (post.type === "web-novel") {
      res.redirect(`/web-novel`);
    } else if (post.type === "anime") {
      res.redirect(`/anime`);
    } else {
      res.status(500).send("Internal Server Error: Unknown post type");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/register", function (req, res) {
  var userData = new userModel({
    username: req.body.username,
    email: req.body.email,
  });

  userModel
    .register(userData, req.body.password)
    .then(function (registeredUser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/home");
      });
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {}
);

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
