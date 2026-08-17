const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendors",
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "SUSPENDED"],
      default: "DRAFT",
      index: true,
    },
    suspensionReason: {
      type: String,
      default: "",
      trim: true,
    },
    freeCancellationHours: {
      type: Number,
      required: true,
      min: 0,
      default: 24,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({
  title: "text",
  description: "text",
});

serviceSchema.index({
  vendor: 1,
  status: 1,
});

serviceSchema.index({
  category: 1,
  status: 1,
});

module.exports = mongoose.model("Service", serviceSchema);