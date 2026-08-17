const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    offering: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offering",
      required: true,
    },
    slotKey: {
      type: String,
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
    },
    paymentMode: {
      type: String,
      enum: ["PAY_NOW", "PAY_AFTER"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: [
        "NOT_REQUIRED",
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
        "COLLECTED",
      ],
      default: "PENDING",
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
        "NO_SHOW",
      ],
      default: "PENDING",
      index: true,
    },
    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({
  vendor: 1,
  status: 1,
  startTime: 1,
});

bookingSchema.index({
  customer: 1,
  status: 1,
  startTime: 1,
});

bookingSchema.index({
  slotKey: 1,
  status: 1,
});

module.exports = mongoose.model("Booking", bookingSchema);