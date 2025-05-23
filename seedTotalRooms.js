// seedTotalRooms.js
const mongoose = require("mongoose");
const Listing = require("./models/listing"); // adjust path if needed
require("dotenv").config();

mongoose.connect(process.env.ATLASDB_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection error", err));

async function updateTotalRooms() {
  try {
    const result = await Listing.updateMany(
      { totalRooms: { $exists: false } },
      { $set: { totalRooms: 15 } }
    );

    console.log(`✅ Updated Listings: ${result.modifiedCount}`);
  } catch (err) {
    console.log("❌ Error updating listings:", err);
  } finally {
    mongoose.connection.close();
  }
}

updateTotalRooms();
