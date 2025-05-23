require("dotenv").config();

const Listing = require("../models/listing");
const Booking = require("../models/booking");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const sendEmail = require("../utils/sendEmail");
const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// ✅ Home page - with search + filter
module.exports.index = async (req, res) => {
  try {
    let query = {};
    const {
      search,
      category,
      minPrice,
      maxPrice,
      amenities,
      propertyType
    } = req.query;

    // ✅ Strict category filter
    if (category && category.trim() !== "") {
      query.category = { $in: [category.trim()] };
    }


    // ✅ Flexible search
    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      const price = parseInt(search.trim(), 10);

      query.$or = [
        { title: regex },
        { location: regex },
        { country: regex }
      ];

      if (!isNaN(price)) {
        query.$or.push({ price: { $lte: price } });
      }
    }

    // ✅ Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    // ✅ Amenities filter (match any)
    if (amenities) {
      query.amenities = {
        $in: Array.isArray(amenities) ? amenities : [amenities]
      };
    }

    // ✅ Property type filter (match any)
    if (propertyType) {
      query.propertyType = {
        $in: Array.isArray(propertyType) ? propertyType : [propertyType]
      };
    }

    const listings = await Listing.find(query);
    res.render("listings/index.ejs", { listings });
  } catch (err) {
    console.error("Error:", err);
    req.flash("error", "Something went wrong while loading listings.");
    res.redirect("/");
  }
};



module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // ✅ Reusable and safe price cleaner
  function cleanPrice(p) {
    if (typeof p === "string") {
      const cleaned = p.replace(/[^0-9.]/g, ""); // Remove $ ₹ ,
      return parseFloat(cleaned) || 0;
    } else if (typeof p === "number") {
      return p;
    } else {
      return 0;
    }
  }

  listing.price = cleanPrice(listing.price);

  const bookings = await Booking.find({ listing: id });

  const totalRooms = listing.totalRooms || 1;
  const dateAvailability = {};

  bookings.forEach(b => {
    const start = new Date(b.checkIn);
    const end = new Date(b.checkOut);
    while (start < end) {
      const key = start.toISOString().split("T")[0];
      dateAvailability[key] = (dateAvailability[key] || 0) + (b.rooms || 1);
      start.setDate(start.getDate() + 1);
    }
  });

  res.render("listings/show.ejs", {
    listing,
    bookings,
    totalRooms,
    dateAvailability,
    currUser: req.user,
    mapToken,
  });
};


module.exports.createListing = async (req, res) => {
  const response = await geocodingClient
    .forwardGeocode({ query: req.body.listing.location, limit: 1 })
    .send();

  const newListing = new Listing({
    ...req.body.listing,
    owner: req.user._id,
    image: {
      url: req.file?.path || "https://via.placeholder.com/400",
      filename: req.file?.filename || "default.jpg",
    },
    geometry: response.body.features[0].geometry,
    totalRooms: req.body.listing.totalRooms || 5,
  });

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const response = await geocodingClient
    .forwardGeocode({
      query: `${req.body.listing.location}, ${req.body.listing.country}`,
      limit: 1,
    })
    .send();

  req.body.listing.geometry = response.body.features[0].geometry;
  const listing = await Listing.findByIdAndUpdate(id, req.body.listing);

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

module.exports.bookListing = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests, rooms } = req.body;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!checkIn || !checkOut) {
    req.flash("error", "Please select check-in and check-out dates.");
    return res.redirect(`/listings/${id}`);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const roomsRequested = Number(rooms) || 1;

  if (checkInDate >= checkOutDate) {
    req.flash("error", "Invalid date range selected.");
    return res.redirect(`/listings/${id}`);
  }

  const bookings = await Booking.find({ listing: id });

  let roomsBooked = {};
  bookings.forEach(b => {
    let current = new Date(b.checkIn);
    while (current < b.checkOut) {
      const dateKey = current.toISOString().split("T")[0];
      roomsBooked[dateKey] = (roomsBooked[dateKey] || 0) + (b.rooms || 1);
      current.setDate(current.getDate() + 1);
    }
  });

  let valid = true;
  const current = new Date(checkInDate);
  while (current < checkOutDate) {
    const key = current.toISOString().split("T")[0];
    const booked = roomsBooked[key] || 0;
    if (booked + roomsRequested > listing.totalRooms) {
      valid = false;
      break;
    }
    current.setDate(current.getDate() + 1);
  }

  if (!valid) {
    req.flash("error", `Not enough rooms available for selected dates.`);
    return res.redirect(`/listings/${id}`);
  }

  const pricePerNight = typeof listing.price === "string"
    ? parseFloat(listing.price.replace(/[$,]/g, ""))
    : Number(listing.price);

  const nights = Math.max(1, (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const totalAmount = pricePerNight * nights * roomsRequested;

  const booking = new Booking({
    user: req.user._id,
    listing: id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests,
    rooms: roomsRequested,
    amountPaid: totalAmount,
  });

  await booking.save();
  req.flash("success", `✅ Booking confirmed from ${checkIn} to ${checkOut}`);
  res.redirect(`/listings/${id}`);
};

module.exports.sendKnowMoreEmail = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("owner");
  const email = req.body.email;

  const message = `
    <h2>${listing.title}</h2>
    <p>${listing.description}</p>
    <p><strong>Price:</strong> ₹${listing.price}</p>
    <p><strong>Amenities:</strong> ${listing.amenities?.join(", ") || "WiFi, AC, Kitchen, Parking"}</p>
    <p><strong>Nearby:</strong> Beach ⛱️, Cafe ☕, Local Market 💼, View Point 🌄</p>
    <p><strong>Rating:</strong> ⭐⭐⭐⭐⭐ (112 reviews)</p>
    <img src="${listing.image?.url || 'https://via.placeholder.com/400'}" width="400" />
  `;

  await sendEmail({
    email,
    subject: `Know More: ${listing.title}`,
    message,
  });

  req.flash("success", "Details sent to your email!");
  res.redirect(`/listings/${listing._id}`);
};
