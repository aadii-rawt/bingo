const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "PENDING", "REJECTED", "SUSPENDED"],
      default: "ACTIVE",
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);