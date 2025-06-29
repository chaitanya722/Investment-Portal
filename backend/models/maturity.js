const mongoose = require("mongoose");

const maturityEntrySchema = new mongoose.Schema({
  note: {
    type: String,
    required: false,
  },
  investedAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  
});

const maturitySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    unique: true, // 1 document per customer
  },
  maturities: [maturityEntrySchema],
});

module.exports = mongoose.model("Maturity", maturitySchema);
