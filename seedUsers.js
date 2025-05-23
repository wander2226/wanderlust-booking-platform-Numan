require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const bcrypt = require("bcrypt");

// ✅ Use DB from .env
const dbUrl = process.env.ATLASDB_URL;

mongoose.connect(dbUrl)
  .then(() => console.log("✅ MongoDB Atlas connected for user seeding!"))
  .catch((err) => console.log("❌ Connection error:", err));

const seedUsers = async () => {
  try {
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash("wander123", 12);

    const users = [
      { email: "aarya.mehta@gmail.com", username: "aarya_mehta", password: hashedPassword },
      { email: "ronak.shah@yahoo.com", username: "ronak_shah", password: hashedPassword },
      { email: "fatima.khan@outlook.com", username: "fatima_k", password: hashedPassword },
      { email: "david.mathews@gmail.com", username: "david_mathews", password: hashedPassword },
      { email: "tanya.singh@hotmail.com", username: "tanya_singh", password: hashedPassword },
    ];

    await User.insertMany(users);
    console.log("✅ 5 real-looking users seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    mongoose.connection.close();
  }
};

seedUsers();
