// updateRooms.js
const mongoose = require("mongoose");
const Listing = require("./models/listing"); // Adjust if path differs

const MONGO_URL = process.env.ATLASDB_URL || "mongodb+srv://wanderlust2226:apzANrNQEP57wiKc@cluster0.sqgsuns.mongodb.net/wanderlustDB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB error:", err));

const updateTotalRooms = async () => {
  const listings = await Listing.find({});

  for (let listing of listings) {
    const randomRooms = Math.floor(Math.random() * 10) + 1;
    listing.totalRooms = randomRooms;
    await listing.save();
    console.log(`✅ Updated ${listing.title} with ${randomRooms} total rooms`);
  }

  mongoose.connection.close();
};

updateTotalRooms();
