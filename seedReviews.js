require("dotenv").config(); // ✅ Load from .env
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Review = require("./models/review");
const User = require("./models/user");

// ✅ Use correct DB from .env
const dbUrl = process.env.ATLASDB_URL;

mongoose.connect(dbUrl)
  .then(() => console.log("✅ MongoDB connected for review seeding!"))
  .catch((err) => console.log("❌ DB connection error:", err));

// Sample review messages
const sampleReviews = [
  "Amazing place, highly recommended!",
  "Had a great time with family.",
  "Clean, comfortable, and peaceful.",
  "Perfect getaway for a weekend.",
  "The host was super helpful!"
];

const getRandomRating = () => Math.floor(Math.random() * 3) + 3;

const seedReviews = async () => {
  try {
    const users = await User.find({});
    if (users.length < 5) {
      console.log("⚠️ You need at least 5 users in your database.");
      return;
    }

    const listings = await Listing.find({});
    for (let listing of listings) {
      const addedReviews = [];

      for (let i = 0; i < 5; i++) {
        const review = new Review({
          rating: getRandomRating(),
          comment: sampleReviews[i],
          author: users[i % users.length]._id,
        });

        await review.save();
        addedReviews.push(review._id);
      }

      listing.reviews.push(...addedReviews);
      await listing.save();
      console.log(`✅ Added 5 reviews to ${listing.title}`);
    }

    console.log("✅ Review seeding completed.");
    mongoose.connection.close();
  } catch (err) {
    console.log("❌ Error during seeding:", err);
    mongoose.connection.close();
  }
};

seedReviews();
