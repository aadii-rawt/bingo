const mongoose = require("mongoose");

const slotInventorySchema = new mongoose.Schema(
  {
    slotKey: {
      type: String,
      required: true,
      unique: true,
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
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
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
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

slotInventorySchema.index({
  service: 1,
  startTime: 1,
});

module.exports =
  mongoose.models.SlotInventory ||
  mongoose.model("SlotInventory", slotInventorySchema);