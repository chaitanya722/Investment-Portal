const mongoose = require("mongoose");

const AboutUsSchema = new mongoose.Schema({
  content: { type: String, required: true }
});
const TermsSchema = new mongoose.Schema({
  content: { type: String, required: true }
});

const ContactUsSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
});

const AboutUs = mongoose.model("AboutUs", AboutUsSchema);
const ContactUs = mongoose.model("ContactUs", ContactUsSchema);
const Terms = mongoose.model("Terms", TermsSchema);

module.exports = { AboutUs, ContactUs,Terms };
