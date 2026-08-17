const mongoose = require("mongoose");

const paymentLedgerSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["PAYMENT", "REFUND", "COLLECTION"],
      required: true,
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
    reference: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

paymentLedgerSchema.index({
  booking: 1,
  createdAt: 1,
});

module.exports = mongoose.model(
  "PaymentLedger",
  paymentLedgerSchema
);