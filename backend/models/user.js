const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pan: { type: String, required: true },
  phone: { type: Number, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  profileImage: {
    type: String,
    default: ""
  },
  investment: {
    totalInvestment: {
      type: Number,
      default: 0
    },
    records: [
      { 
        investmentAmount: Number,
        todayValue: Number,
        returnMonth: String,
        installments: Number,
        planName: String,
        investmentDate: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },

  achievements: [
    {
      imageUrl: { type: String, required: true },
      addedAt: { type: Date, default: Date.now }
    }
  ],

  bankDetails: {
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String },
    branchName: { type: String },
    upiId: { type: String }
  },
  bonus: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
