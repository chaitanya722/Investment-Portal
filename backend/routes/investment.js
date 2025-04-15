const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Add Investment API
router.post("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      investmentAmount,
      returnMonth,
      installments,
      planName,
      investmentDate, // Optional: use default if not provided
    } = req.body;

    // Validate investmentAmount
    if (!investmentAmount || investmentAmount <= 0) {
      return res.status(400).json({ message: "Invalid investment amount" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare investment record
    const newInvestment = {
      investmentAmount,
      returnMonth: returnMonth || "",
      installments: installments || 0,
      planName: planName || "",
      investmentDate: investmentDate || new Date()
    };

    // Add investment to records
    user.investment.records.push(newInvestment);

    // Update total investment
    user.investment.totalInvestment += investmentAmount;

    // Save user
    await user.save();

    res.status(200).json({ message: "Investment added successfully", user });
  } catch (error) {
    console.error("Error adding investment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
