const express = require("express");
const router = express.Router();
const Maturity = require("../models/maturity");

// Add a maturity entry for a customer
router.post("/create", async (req, res) => {
  try {
    const { customerId,investedAmount, date,note } = req.body;

    if (!customerId || !investedAmount || !date || !note) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Build the new entry
    const newMaturityEntry = {
      investedAmount,
      date,
      note
    };

    // Check if customer document already exists
    let customerMaturity = await Maturity.findOne({ customerId });

    if (customerMaturity) {
      // Push new entry to existing customer's array
      customerMaturity.maturities.push(newMaturityEntry);
      await customerMaturity.save();
    } else {
      // Create new document for this customer
      customerMaturity = new Maturity({
        customerId,
        maturities: [newMaturityEntry],
      });
      await customerMaturity.save();
    }

    res.status(201).json({ message: "Maturity added successfully", data: customerMaturity });
  } catch (error) {
    console.error("Error creating maturity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// route: PUT /api/maturity/dontshowagain/:userId

router.put('/dontshowagain/:customerId', async (req, res) => {
    try {
      await Maturity.updateMany(
        { userId: req.params.userId },
        { $set: { dontshowagain: req.body.dontshowagain } }
      );
      res.status(200).json({ success: true, message: "Updated dontshowagain flag." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  
router.get("/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      if (!customerId) return res.status(400).json({ error: "Customer ID required" });
  
      const customerMaturity = await Maturity.findOne({ customerId });
      if (!customerMaturity) return res.status(404).json({ message: "No maturities found" });
  
      res.status(200).json({ data: customerMaturity.maturities });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

module.exports = router;
