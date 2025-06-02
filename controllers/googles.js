const passport = require("passport");
const User = require("../models/user.js");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Load env vars
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

// Debug logs (optional)
console.log("✅ GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "Loaded" : "Missing");
console.log("✅ GOOGLE_CALLBACK_URL:", GOOGLE_CALLBACK_URL || "Missing");

// Register strategy only if env vars are defined
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL) {
	passport.use(
		new GoogleStrategy(
			{
				clientID: GOOGLE_CLIENT_ID,
				clientSecret: GOOGLE_CLIENT_SECRET,
				callbackURL: GOOGLE_CALLBACK_URL,
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					let user = await User.findOne({ providerId: profile.id });
					if (user) return done(null, user);

					const newUser = new User({
						providerId: profile.id,
						provider: "google",
						fName: profile._json.given_name,
						lName: profile._json.family_name,
						email:
							profile._json.email ||
							`google${Math.floor(Math.random() * 501 + 500)}@example.com`,
						username:
							profile._json.given_name.toLowerCase() +
							Math.floor(Math.random() * 501 + 500),
						image: {
							url: profile._json.picture?.replace("=s96-c", "=s400-c") || "",
							filename: `google${profile.id}`,
						},
					});
					const savedUser = await newUser.save();
					console.log("✅ New Google user created:", savedUser.username);
					return done(null, savedUser);
				} catch (err) {
					console.error("❌ Error in Google Strategy:", err);
					return done(err);
				}
			}
		)
	);
} else {
	console.warn("⚠️ Google OAuth strategy skipped due to missing env vars.");
}

module.exports = passport;
