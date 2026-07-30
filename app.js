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


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


function wrapAsync(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
}


app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));


app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});


app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new Error("Listing not found!");
  }
  res.render("listings/show.ejs", { listing });
}));


app.post("/listings", wrapAsync(async (req, res) => {
  if (!req.body.listing) {
    throw new Error("Please fill all details properly!");
  }
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));


app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new Error("Listing not found for edit!");
  }
  res.render("listings/edit.ejs", { listing });
}));


app.put("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  if (!req.body.listing) {
    throw new Error("Please fill valid details for update!");
  }


  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });


  if (req.body.listing.image && req.body.listing.image.url) {
    listing.image.url = req.body.listing.image.url;
    await listing.save();
  }

 
  res.redirect("/listings");
}));


app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));


app.get("/", (req, res) => {
  res.redirect("/listings");
});


app.use((err, req, res, next) => {
  let { message = "Please fill all details " } = err;
  res.status(400).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
