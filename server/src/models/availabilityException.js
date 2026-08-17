const mongoose = require("mongoose");

const windowSchema = new mongoose.Schema(
  {
    start: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    end: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
  },
  {
    _id: false,
  }
);

const availabilityExceptionSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    type: {
      type: String,
      enum: ["CLOSED", "OPEN"],
      required: true,
    },
    windows: {
      type: [windowSchema],
      default: [],
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

availabilityExceptionSchema.index(
  {
    service: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "AvailabilityException",
  availabilityExceptionSchema
);