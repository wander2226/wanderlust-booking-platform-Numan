require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Listing = require("../models/listing");
const Booking = require("../models/booking");

// ✅ Create Stripe Checkout Session
module.exports.createStripeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkin, checkout, rooms } = req.query;

    // Validate required inputs
    if (!checkin || !checkout || !rooms) {
      throw new Error("Missing required booking details");
    }

    const listing = await Listing.findById(id);
    if (!listing) throw new Error("Listing not found");

    const checkInDate = new Date(checkin);
    const checkOutDate = new Date(checkout);
    const totalRooms = Number(rooms);

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (nights <= 0) throw new Error("Invalid booking duration");

    const pricePerNight = Number(listing.price);
    const totalAmount = pricePerNight * nights * totalRooms;

    // ✅ Debug Log
    console.log("🔁 Stripe Checkout Session Debug:", {
      listing: listing.title,
      nights,
      totalRooms,
      unit_price: pricePerNight,
      totalAmount
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: listing.title,
              description: listing.description || "WanderLust listing",
            },
            unit_amount: Math.round(pricePerNight * 100), // price in cents
          },
          quantity: nights * totalRooms, // total nights × rooms
        },
      ],
      success_url: `${req.protocol}://${req.get("host")}/payments/success?listingId=${listing._id}&amount=${totalAmount.toFixed(2)}&checkin=${checkin}&checkout=${checkout}&rooms=${rooms}`,
      cancel_url: `${req.protocol}://${req.get("host")}/payments/cancel`,
    });

    res.redirect(303, session.url);
  } catch (err) {
    console.error("❌ Stripe Session Error:", err.message);
    console.error(err.stack || err);
    res.status(500).send("Something went wrong during checkout.");
  }
};

// ✅ Handle Stripe Success Redirect
module.exports.renderSuccessPage = async (req, res) => {
  try {
    const { listingId, amount, checkin, checkout, rooms } = req.query;

    if (req.user && listingId && amount) {
      await Booking.create({
        user: req.user._id,
        listing: listingId,
        checkIn: new Date(checkin),
        checkOut: new Date(checkout),
        rooms: Number(rooms) || 1,
        guests: 1,
        amountPaid: parseFloat(amount),
      });

      req.flash("success", "✅ Payment successful! Booking confirmed.");
    }

    res.render("payments/success");
  } catch (err) {
    console.error("❌ Booking Save Error:", err.message);
    req.flash("error", "Payment succeeded, but booking could not be saved.");
    res.redirect("/listings");
  }
};

// ✅ Handle Cancel
module.exports.renderCancelPage = (req, res) => {
  res.send("<h1>❌ Payment Cancelled</h1>");
};
