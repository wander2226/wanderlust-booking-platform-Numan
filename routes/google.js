const express = require("express");
const router = express.Router();
const passport = require("../controllers/googles.js");

// ✅ Initiate Google OAuth
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Google OAuth callback
router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful login, redirect to home
    res.redirect("/");
  }
);

module.exports = router;
