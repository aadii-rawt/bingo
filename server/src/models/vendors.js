const mongoose = require("mongoose");

const vendorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
    },
    address: {
      type : String,
      required : true,
      default : "Delhi"
    },
    timezone: {
      type: String,
      required: true,
      default: "Asia/Kolkata",
    },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
module.exports =
    mongoose.models.Vendor ||
    mongoose.model("Vendor", vendorProfileSchema);