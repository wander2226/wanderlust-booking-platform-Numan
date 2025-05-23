const nodemailer = require("nodemailer");
const Listing = require("../models/listing");
const ejs = require("ejs");
const path = require("path");

// ✅ Mail Transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ 1. Booking Email after Stripe
module.exports.sendBookingEmail = async (req, res) => {
  const { id } = req.params;
  const { checkin, checkout, price } = req.body;

  const listing = await Listing.findById(id).populate("owner");

  const nights = Math.ceil(
    (new Date(checkin) - new Date(checkout)) / (-1000 * 60 * 60 * 24)
  );
  const total = (price * nights).toFixed(2);

  const templatePath = path.join(__dirname, "../views/emails/bookingEmail.ejs");

  const htmlContent = await ejs.renderFile(templatePath, {
    listing,
    checkinDate: checkin,
    checkoutDate: checkout,
    nights,
    totalPrice: total,
  });

  await transporter.sendMail({
    from: `"WanderLust 🏡" <${process.env.EMAIL_USER}>`,
    to: req.user.email,
    subject: `Your Booking Details for ${listing.title}`,
    html: htmlContent,
  });

  req.flash("success", "📩 Booking info email sent!");
  res.redirect(`/listings/${id}`);
};

// ✅ 2. "Know More" Button Email
module.exports.sendKnowMoreEmail = async (req, res) => {
  const { id } = req.params;
  const { email, checkin, checkout } = req.body;

  if (!email || !checkin || !checkout) {
    req.flash("error", "Missing email or date info.");
    return res.redirect(`/listings/${id}`);
  }

  const listing = await Listing.findById(id).populate("owner");

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;">
      <h2 style="color:#333;margin-bottom:4px;">${listing.title}</h2>
      <p style="color:#555;">${listing.description}</p>
      <p><strong>Price:</strong> $${Number(listing.price).toLocaleString("en-US")} USD/night</p>
      <p><strong>Check-in:</strong> ${checkin}</p>
      <p><strong>Check-out:</strong> ${checkout}</p>
      <p><strong>Amenities:</strong> ${listing.amenities?.join(", ") || "WiFi, AC, Kitchen, Parking"}</p>
      <p><strong>Nearby:</strong> 🏖️ Beach, ☕ Cafe, 🛍️ Local Market, 🌇 View Point</p>
      <p><strong>Rating:</strong> ⭐⭐⭐⭐⭐ (112 reviews)</p>
      <img src="${listing.image?.url || "https://via.placeholder.com/400"}" alt="Listing Image" style="width:100%;max-width:400px;border-radius:8px;margin-top:10px;" />
    </div>
  `;

  await transporter.sendMail({
    from: `"WanderLust 🏡" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Know More: ${listing.title}`,
    html: htmlContent,
  });

  req.flash("success", "📩 Listing details sent to your email!");
  res.redirect(`/listings/${id}`);
};