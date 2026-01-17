const express = require("express");
const router = express.Router();
const passport = require("passport");

// 🔐 Start GitHub OAuth
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// 🔐 GitHub OAuth callback
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/listings");
  }
);

module.exports = router;
