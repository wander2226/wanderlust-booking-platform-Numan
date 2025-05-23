const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Stripe checkout session route
router.get("/create-checkout-session/:id", paymentController.createStripeSession);

// Payment success and cancel routes
router.get("/success", paymentController.renderSuccessPage);
router.get("/cancel", paymentController.renderCancelPage);

module.exports = router;
