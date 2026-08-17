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

const availabilityRuleSchema = new mongoose.Schema(
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
    weekday: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    windows: {
      type: [windowSchema],
      default: [],
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

availabilityRuleSchema.index(
  {
    service: 1,
    weekday: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "AvailabilityRule",
  availabilityRuleSchema
);