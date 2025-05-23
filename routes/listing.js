const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {
  isLoggedIn,
  isOwner,
  validateListing
} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// ✅ Index (with search + filter) & Create
router
  .route("/")
  .get(wrapAsync(listingController.index))  // Handles ?search= & ?category=
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// ✅ New Listing Form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// ✅ Booking Route - must be before `/:id`
router.get(
  "/:id/book",
  isLoggedIn,
  wrapAsync(listingController.bookListing)
);

// ✅ Show, Update, Delete Listing
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// ✅ Edit Form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// ✅ Optional Redirects for clean filter & search URLs
router.get("/filter/:category", (req, res) => {
  const category = req.params.category;
  res.redirect(`/listings?category=${encodeURIComponent(category)}`);
});

router.get("/search", (req, res) => {
  const search = req.query.q;
  res.redirect(`/listings?search=${encodeURIComponent(search)}`);
});

module.exports = router;
