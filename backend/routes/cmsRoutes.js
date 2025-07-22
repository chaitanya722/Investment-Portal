const express = require("express");
const router = express.Router();
const { AboutUs, ContactUs,Terms } = require("../models/CMSModel");
const nodemailer = require("nodemailer");

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


router.post("/contactform", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Contact Us" <${process.env.EMAIL_USERNAME}>`,
      to: "adityabirlamutualfundsunlife@gmail.com",
      subject: `New message from ${name}`,
      html: `
        <h2>Contact Us Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent successfully." });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});

module.exports = router;
