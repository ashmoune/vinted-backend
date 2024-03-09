// importation d"express pour les routes
const express = require("express");
const router = express.Router();
// sha256 hache le mdp utilisateur et encbase64 le convertit en string
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
// génere des identifiants unique
const uid2 = require("uid2");

// importation d'un model user
const User = require("../models/User");

// SIGNUP POST /user/signup
router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;
    // vérification si l'email existe déja
    const existingMail = await User.findOne({ email: req.body.email });
    if (existingMail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // vérif si le nom d'utilisateur existe dans la BDD
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    //

    //  création du token
    const token = uid2(32);
    // Hashage
    const salt = uid2(16);
    // console.log(token, salt);
    const hash = SHA256(req.body.password + salt).toString(encBase64);
    // console.log(hash);
    // création d'un nouvel user avec les infos transmises
    const newUser = new User({
      email: email,
      account: {
        username: username,
      },
      newsletter: newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });
    // sauvegarde dans la BDD
    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;
    // console.log(req.body);
    const user = await User.findOne({ email: email });
    if (user) {
      const newHash = SHA256(password + user.salt).toString(encBase64);
      if (newHash === user.hash) {
        res.json({ _id: user._id, token: user.token, account: user.account });
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// exportation du router dans d'autres fichiers
module.exports = router;
