const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");
}
main().catch((err) => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Error Handler Wrapper
function wrapAsync(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
}

// 1. Index Route (Home Page)
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// 2. New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// 3. Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new Error("Listing not found!");
  }
  res.render("listings/show.ejs", { listing });
}));

// 4. Create Route
app.post("/listings", wrapAsync(async (req, res) => {
  if (!req.body.listing) {
    throw new Error("Please fill all details properly!");
  }
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

// 5. Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new Error("Listing not found for edit!");
  }
  res.render("listings/edit.ejs", { listing });
}));

// 6. Update Route (PUT) - IMAGE UPDATE FIX HERE
app.put("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  if (!req.body.listing) {
    throw new Error("Please fill valid details for update!");
  }

  // Listing Update
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });

  // Explicit Image URL Update (Forcing image change)
  if (req.body.listing.image && req.body.listing.image.url) {
    listing.image.url = req.body.listing.image.url;
    await listing.save();
  }

  // Edit save hone ke baad direct Home Page (/listings) par redirect
  res.redirect("/listings");
}));

// 7. Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

// Root Route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Custom Error Page Middleware (Crash hone se rokega)
app.use((err, req, res, next) => {
  let { message = "Please fill all details properly!" } = err;
  res.status(400).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});