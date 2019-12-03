const express = require("express");
const request = require("request");
const config = require("config");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");
const { check, validationResult } = require("express-validator");

// @route       GET api/profile/me
// @desc        Get current users profile
// @access      PRIVATE
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is no profile for this user." });
    }
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error.");
  }
});

// @route       POST api/profile
// @desc        Create or update user profile.
// @access      PRIVATE
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required!")
        .not()
        .isEmpty(),
      check("skills", "Skills is required!")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }
      //Create
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// @route       GET api/profile
// @desc        Get all profiles
// @access      PUBLIC
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500), send("Internal Server Error");
  }
});

// @route       GET api/profile/user/:user_id
// @desc        Get profile by user id
// @access      PUBLIC
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).json({ msg: "Profile Not Found." });

    res.json(profile);
  } catch (error) {
    console.log(error.message);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile Not Found." });
    }
    res.status(500), send("Internal Server Error");
  }
});

// @route       DELETE api/profile
// @desc        Delete profile based on the id
// @access      PRIVATE
router.delete("/", auth, async (req, res) => {
  try {
    //Remove user post
    await Post.deleteMany({ user: req.user.id });
    //Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Remove User
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted!" });
  } catch (error) {
    console.log(error.message);
    res.status(500), send("Internal Server Error");
  }
});

// @route       PUT api/profile/experience
// @desc        Add profile experience
// @access      PRIVATE
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required!")
        .not()
        .isEmpty(),
      check("company", "Company is required!")
        .not()
        .isEmpty(),
      check("from", "From date is required!")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExperience);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// @route       DELETE api/profile/experience/:exp_id
// @desc        Delete experience profile experience
// @access      PRIVATE
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get array of all the ids
    const ids = profile.experience.map(item => item.id);
    const isTrue = ids.includes(req.params.exp_id);

    if (!isTrue) return res.status(400).json({ msg: "Profile Not Found!" });

    const removeIndex = ids.indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error.");
  }
});

// @route       PUT api/profile/education
// @desc        Add profile education
// @access      PRIVATE
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required!")
        .not()
        .isEmpty(),
      check("degree", "Degree is required!")
        .not()
        .isEmpty(),
      check("fieldofstudy", "Field of study is required!")
        .not()
        .isEmpty(),
      check("from", "From date is required!")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEducation);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// @route       DELETE api/profile/education/:edu_id
// @desc        Delete profile education
// @access      PRIVATE
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get array of all the ids
    const ids = profile.education.map(item => item.id);
    const isTrue = ids.includes(req.params.edu_id);

    if (!isTrue) return res.status(400).json({ msg: "Profile Not Found!" });

    const removeIndex = ids.indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error.");
  }
});

// @route       GET api/profile/github/:username
// @desc        Get user repos from github
// @access      PUBLIC
router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" }
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No github profile found." });
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error.");
  }
});

module.exports = router;
