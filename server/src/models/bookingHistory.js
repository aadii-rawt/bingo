const mongoose = require("mongoose");

const bookingHistorySchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
        "NO_SHOW",
        null,
      ],
      default: null,
    },
    toStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
        "NO_SHOW",
      ],
      required: true,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingHistorySchema.index({
  booking: 1,
  createdAt: 1,
});

module.exports = mongoose.model(
  "BookingHistory",
  bookingHistorySchema
);