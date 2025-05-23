const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// Booking subdocument schema
const bookingSchema = new Schema({
  checkin: {
    type: Date,
    required: true,
  },
  checkout: {
    type: Date,
    required: true,
  },
  roomsBooked: {
    type: Number,
    required: true,
    default: 1,
    min: [1, "At least one room must be booked"],
  },
}, { _id: false }); // Disable _id for subdocs if not needed

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,
  },
  location: String,
  country: String,

  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Review",
  }],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },

  category: {
    type: [String],
    default: [],
  },

  totalRooms: {
    type: Number,
    required: true,
    default: 5,
    min: [1, "There must be at least 1 room"],
  },

  bookings: [bookingSchema],
});

// Cascade delete reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
