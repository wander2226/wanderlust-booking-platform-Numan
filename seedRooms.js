// seedRooms.js
const mongoose = require("mongoose");
const Listing = require("./models/listing"); // Adjust path if needed

mongoose.connect("mongodb://127.0.0.1:27017/wanderlustDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB error:", err));

const seedRooms = async () => {
  await Listing.deleteMany({}); // Optional: clear old listings

  for (let i = 1; i <= 10; i++) {
    const randomRooms = Math.floor(Math.random() * 10) + 1;

    const listing = new Listing({
      title: `Test Listing ${i}`,
      description: `Sample description for Listing ${i}`,
      price: 3000 + i * 100,
      location: "Goa",
      country: "India",
      owner: "6653e12d6f9c71d35ce25d88", // Replace with valid ObjectId
      image: {
        url: "https://via.placeholder.com/300",
        filename: "sample.jpg",
      },
      geometry: {
        type: "Point",
        coordinates: [73.8567, 15.2993],
      },
      category: ["Beachfront"],
      totalRooms: randomRooms, // ✅ Random room count
    });

    await listing.save();
    console.log(`✅ Listing ${i} with ${randomRooms} rooms saved.`);
  }

  mongoose.connection.close();
};

seedRooms();
