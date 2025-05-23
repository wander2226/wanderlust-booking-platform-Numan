const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");
const { isLoggedIn } = require("../middleware");

// ✅ 1. Send Booking Email after payment (Stripe)
router.post("/send-booking-email/:id", isLoggedIn, emailController.sendBookingEmail);

// ✅ 2. Send Know More Email from form
router.post("/listings/:id/know-more", emailController.sendKnowMoreEmail);

module.exports = router;
