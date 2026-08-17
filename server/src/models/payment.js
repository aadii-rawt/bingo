const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
    },
    mode: {
      type: String,
      enum: ["PAY_NOW", "PAY_AFTER"],
      required: true,
    },
    status: {
      type: String,
      enum: ["INITIATED", "SUCCESS", "FAILED", "REFUNDED"],
      default: "INITIATED",
      index: true,
    },
    providerReference: {
      type: String,
      default: null,
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
    },
    failureReason: {
      type: String,
      default: "",
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index(
  {
    idempotencyKey: 1,
  },
  {
    unique: true,
  }
);

paymentSchema.index({
  booking: 1,
  status: 1,
});

module.exports =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);