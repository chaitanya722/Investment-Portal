const express = require("express");
const router = express.Router();
const { AboutUs, ContactUs,Terms } = require("../models/CMSModel");

// ✅ Add or Update About Us
router.put("/about", async (req, res) => {
  try {
    const { content } = req.body;
    const about = await AboutUs.findOneAndUpdate({}, { content }, { upsert: true, new: true });
    res.status(200).json({ message: "About Us updated", data: about });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get About Us
router.get("/about", async (req, res) => {
  try {
    const about = await AboutUs.findOne();
    res.status(200).json(about || { content: "" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Add or Update Contact Us
router.put("/contact", async (req, res) => {
  try {
    const { email, phone, address } = req.body;
    const contact = await ContactUs.findOneAndUpdate({}, { email, phone, address }, { upsert: true, new: true });
    res.status(200).json({ message: "Contact Us updated", data: contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get Contact Us
router.get("/contact", async (req, res) => {
  try {
    const contact = await ContactUs.findOne();
    res.status(200).json(contact || { email: "", phone: "", address: "" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Add or Update About Us
router.put("/terms", async (req, res) => {
  try {
    const { content } = req.body;
    const terms = await Terms.findOneAndUpdate({}, { content }, { upsert: true, new: true });
    res.status(200).json({ message: "Terms updated", data: terms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get About Us
router.get("/terms", async (req, res) => {
  try {
    const about = await Terms.findOne();
    res.status(200).json(about || { content: "" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
