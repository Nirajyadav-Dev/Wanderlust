const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?auto=format&fit=crop&w=800&q=60";

const listingSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  image: {
    filename: { 
      type: String, 
      default: "listingimage" 
    },
    url: {
      type: String,
      default: DEFAULT_IMAGE_URL,
      set: (v) => (v === "" ? DEFAULT_IMAGE_URL : v),
    },
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
    set: (v) => (v === "" || isNaN(v) ? 0 : v),
  },
  location: String,
  country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;