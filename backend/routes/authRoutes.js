const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const transporter = require('../config/mailConfig');
require("dotenv").config();
const multer = require("multer");


const router = express.Router();



// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// In-memory OTP storage (in production use Redis or DB with TTL)
const otpStore = {};

const JWT_SECRET = "your_main_jwt_secret";         // real token after OTP
const TEMP_TOKEN_SECRET = "temporary_token_secret"; // temp token for otp verification

// Helper: Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


// 📌 Route to add an achievement for a user
router.post("/user/:id/achievement", upload.single("achievementImage"), async (req, res) => {
  try {
    const userId = req.params.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imageUrl) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure the achievements field exists
    if (!user.achievements) {
      user.achievements = [];
    }

    // Add new achievement
    user.achievements.push({ imageUrl, addedAt: new Date() });

    await user.save();

    res.status(200).json({
      message: "Achievement added successfully",
      user,
    });
  } catch (error) {
    console.error("Error adding achievement:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// GET all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Excluding password for security
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET  user

router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, "-password"); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT API to update user details or investments
router.put("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, pan, investment } = req.body;

    // Build the update object dynamically
    const updateFields = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    if (phone) updateFields.phone = phone;
    if (pan) updateFields.pan = pan;

    if (investment) {
      updateFields.investment = {};
  
      // Store totalInvestment if passed
      if (typeof investment.totalInvestment === "number") {
        updateFields.investment.totalInvestment = investment.totalInvestment;
      }

      // Validate and assign each record, expecting todayValue optionally
      if (Array.isArray(investment.records)) {
        const validatedRecords = investment.records.map((rec) => ({
          ...rec,
          todayValue: typeof rec.todayValue === "number"
            ? rec.todayValue
            : rec.investmentAmount || 0, // Default to investmentAmount if not provided
        }));
        updateFields.investment.records = validatedRecords;
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "At least one field is required to update." });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error });
  }
});



// DELETE API to remove a user
router.delete("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, username,pan,phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    let generatedUsername = username || email.split("@")[0];

    let usernameExists = await User.findOne({ username: generatedUsername });
    while (usernameExists) {
      generatedUsername = `${generatedUsername}${Math.floor(Math.random() * 1000)}`;
      usernameExists = await User.findOne({ username: generatedUsername });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      name, 
      email, 
      username: generatedUsername, 
      password: hashedPassword, 
      role,
      pan,
      phone
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", username: generatedUsername });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, role: user.role, username: user.username, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT API to update/add bank details
router.put("/users/:id/bank-details", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
      upiId
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        bankDetails: {
          accountHolderName,
          accountNumber,
          ifscCode,
          bankName,
          branchName,
          upiId
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Bank details updated successfully.",
      bankDetails: updatedUser.bankDetails
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/user/:id/bonus", async (req, res) => {
  const { id } = req.params;
  const { bonus } = req.body;

  try {
    await User.findByIdAndUpdate(id, { bonus });
    res.status(200).json({ message: "Bonus updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update bonus" });
  }
});

router.put(
  "/:id/upload-profile-image",
  upload.single("image"),
  async (req, res) => {
    try { 
      const userId = req.params.id;
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profileImage: imageUrl },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({ message: "Image uploaded", imageUrl });
    } catch (err) {
      console.error("Error uploading image:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);



/**
 * STEP 1 - Verify email/password, send OTP
 */
router.post("/verify-credentials", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate and send OTP
    const otp = generateOTP();
    otpStore[email] = otp;

    // Send email
    await transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    });

    // Generate temporary token
    const tempToken = jwt.sign({ email }, TEMP_TOKEN_SECRET, { expiresIn: "5m" });

    return res.json({ tempToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * STEP 2 - Verify OTP and generate final auth token
 */
router.post("/verify-otp", async (req, res) => {
  const { email, otp, tempToken } = req.body;

  try {
    // Verify temp token
    const decoded = jwt.verify(tempToken, TEMP_TOKEN_SECRET);
    if (decoded.email !== email) return res.status(401).json({ message: "Invalid token" });

    // Validate OTP
    if (otpStore[email] !== otp) return res.status(401).json({ message: "Invalid OTP" });

    delete otpStore[email]; // Clear OTP after use

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    return res.json({
      token,
      role: user.role,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name, // include any other fields you might need
      }
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(401).json({ message: "Invalid or expired OTP/session" });
  }
});


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    otpStore[email] = otp;

    // Send OTP via email
    await transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "Reset Your Password - OTP",
      text: `Your OTP for password reset is: ${otp}`,
    });

    // Generate temporary token valid for OTP verification
    const tempToken = jwt.sign({ email }, TEMP_TOKEN_SECRET, { expiresIn: "5m" });

    res.status(200).json({ message: "OTP sent to email", tempToken });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/forgot-password/verify-otp", async (req, res) => {
  const { email, otp, tempToken } = req.body;

  try {
    const decoded = jwt.verify(tempToken, TEMP_TOKEN_SECRET);
    if (decoded.email !== email) return res.status(401).json({ message: "Invalid token" });

    if (otpStore[email] !== otp) return res.status(400).json({ message: "Invalid OTP" });

    // OTP verified, allow password reset
    const resetToken = jwt.sign({ email }, TEMP_TOKEN_SECRET, { expiresIn: "10m" });

    delete otpStore[email]; // Invalidate OTP after successful verification

    res.status(200).json({ message: "OTP verified", resetToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

router.post("/forgot-password/reset", async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const decoded = jwt.verify(resetToken, TEMP_TOKEN_SECRET);
    const { email } = decoded;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});




module.exports = router;
