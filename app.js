require("dotenv").config();
console.log("✅ MAPBOX_TOKEN Loaded:", process.env.MAPBOX_TOKEN);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// ✅ Route imports
const googleRoute = require("./routes/google.js");
const githubRoute = require("./routes/github.js");
const stripePaymentRoute = require("./routes/payments");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const emailRoutes = require("./routes/email.js");
const footerPagesRouter = require("./routes/footerPages.js"); // ✅ NEW LINE

// ✅ Connect to MongoDB
const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ✅ View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Session store setup
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", (e) => {
  console.log("❌ SESSION STORE ERROR:", e);
});

const sessionConfig = {
  store,
  name: "session",
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport setup
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Set locals for views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.mapToken = process.env.MAPBOX_TOKEN;
  next();
});

// ✅ Home redirect
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/auth/google", googleRoute);

// ✅ GitHub auth safety check
if (typeof githubRoute === "function" || typeof githubRoute === "object") {
  app.use("/auth/github", githubRoute);
} else {
  console.log("⚠️ Warning: githubRoute not properly exported");
}

// ✅ Review edit placeholder
app.get("/listings/:id/reviewedit", (req, res) => {
  res.send("<h2>Bro you can simply delete it and add a new review!</h2>");
});

// ✅ Route bindings
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", emailRoutes);
app.use("/payments", stripePaymentRoute);
app.use("/", footerPagesRouter); // ✅ MOUNTED STATIC PAGES

// 🔍 ADVANCED SEARCH ROUTE
const Listing = require("./models/listing.js");

app.get("/listings/search", async (req, res) => {
  const query = req.query.q?.trim() || "";

  const words = query.split(/\s+/);
  const regexWords = [];
  const orConditions = [];
  let priceConditions = [];

  for (let word of words) {
    if (/^<\d+$/.test(word)) {
      priceConditions.push({ price: { $lt: parseFloat(word.slice(1)) } });
    } else if (/^>\d+$/.test(word)) {
      priceConditions.push({ price: { $gt: parseFloat(word.slice(1)) } });
    } else if (/^=\d+$/.test(word)) {
      priceConditions.push({ price: { $eq: parseFloat(word.slice(1)) } });
    } else if (!isNaN(word)) {
      priceConditions.push({ price: { $eq: parseFloat(word) } });
    } else {
      regexWords.push(new RegExp(word, "i"));
    }
  }

  if (regexWords.length > 0) {
    orConditions.push(
      { title: { $in: regexWords } },
      { location: { $in: regexWords } },
      { country: { $in: regexWords } }
    );
  }

  if (priceConditions.length > 0) {
    orConditions.push(...priceConditions);
  }

  try {
    const listings = await Listing.find({ $or: orConditions });
    res.render("listings/index", { listings });
  } catch (err) {
    console.error("❌ Advanced Search Error:", err);
    res.status(500).send("Search failed");
  }
});

// ✅ 404 handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// ✅ Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { message: err.message });
});

// ✅ Server start
app.listen(8080, () => {
  console.log("🚀 Server running on port 8080");
});
