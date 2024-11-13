const express = require("express");
const router = express.Router();

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

router.post("user/signup", async (req: Request, res: Response) => {
  const { username, email, password, confirmePassword } = req.body;
  try {
    if (password !== confirmePassword) {
      return res.status(400).json({ message: "Passwords not identique" });
    }
    if (!username || !email || !password) {
      return res.status(400).json({ message: "missing parameters" });
    }
    const user = await User.findOne({ email: email });
    // console.log(user);
    if (user) {
      return res.status(409).json({ message: "email already exists" });
    }
    const salt = uid2(64);
    const hash = SHA256(req.body.password + salt).toString(encBase64);
    const token = uid2(64);
    const newUser = new User({
      email: email,
      account: {
        username: username,
        avatar: req.body.avatar,
      },
      newsletter: req.body.newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });
    await newUser.save();
    res.status(201).jjson({
      _id: newUser._id,
      token: newUser.token,
      account: {
        username: newUser.account.username,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
