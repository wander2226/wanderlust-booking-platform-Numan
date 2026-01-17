const passport = require("passport");
const User = require("../models/user.js");
const GitHubStrategy = require("passport-github2").Strategy;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

// Log values to verify they're loaded in Railway (you can remove these after debugging)
console.log("✅ GITHUB_CLIENT_ID:", GITHUB_CLIENT_ID ? "Loaded" : "Missing");
console.log("✅ GITHUB_CLIENT_SECRET:", GITHUB_CLIENT_SECRET ? "Loaded" : "Missing");
console.log("✅ GITHUB_CALLBACK_URL:", GITHUB_CALLBACK_URL ? "Loaded" : "Missing");

if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET && GITHUB_CALLBACK_URL) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL,
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          let user = await User.findOne({ providerId: profile.id });
          if (!user) {
            user = new User({
              providerId: profile.id,
              provider: "github",
              username: profile.username,
              email:
                profile.emails?.[0]?.value ||
                `github${Math.floor(Math.random() * 9000) + 1000}@example.com`,
              image: {
                url: profile.photos?.[0]?.value || "",
                filename: `github${profile.id}`,
              },
            });
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
} else {
  console.warn("⚠️ GitHub OAuth strategy skipped due to missing environment variables.");
}

module.exports = passport;
