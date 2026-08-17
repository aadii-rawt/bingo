const Booking = require("../models/booking");
const SlotInventory = require("../models/slotInventory");
const Service = require("../models/services");
const Offering = require("../models/offering");
const Vendor = require("../models/vendors");

const createBooking = async (req, res) => {
  try {
    const {
      slotKey,
      paymentMode,
      notes,
    } = req.body;

    if (!slotKey || !paymentMode) {
      return res.status(400).json({
        success: false,
        message: "Slot and payment mode are required",
      });
    }

    if (!["PAY_NOW", "PAY_AFTER"].includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment mode",
      });
    }

    const now = new Date();

    const inventory = await SlotInventory.findOneAndUpdate(
      {
        slotKey,
        startTime: {
          $gt: now,
        },
        $expr: {
          $lt: ["$bookedCount", "$capacity"],
        },
      },
      {
        $inc: {
          bookedCount: 1,
        },
      },
      {
        new: true,
      }
    );

    if (!inventory) {
      return res.status(409).json({
        success: false,
        message: "Slot is no longer available",
      });
    }

    try {
      const service = await Service.findById(
        inventory.service
      );

      if (!service) {
        await SlotInventory.updateOne(
          { _id: inventory._id },
          { $inc: { bookedCount: -1 } }
        );

        return res.status(404).json({
          success: false,
          message: "Service not found",
        });
      }

      const offering = await Offering.findOne({
        _id: inventory.offering,
        service: inventory.service,
        isActive: true,
      });

      if (!offering) {
        await SlotInventory.updateOne(
          { _id: inventory._id },
          { $inc: { bookedCount: -1 } }
        );

        return res.status(404).json({
          success: false,
          message: "Offering not found",
        });
      }

      const vendor = await Vendor.findById(
        inventory.vendor
      );

      if (!vendor) {
        await SlotInventory.updateOne(
          { _id: inventory._id },
          { $inc: { bookedCount: -1 } }
        );

        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        });
      }

      if (vendor.approvalStatus !== "APPROVED") {
        await SlotInventory.updateOne(
          { _id: inventory._id },
          { $inc: { bookedCount: -1 } }
        );

        return res.status(403).json({
          success: false,
          message: "Vendor is not approved",
        });
      }

      const booking = await Booking.create({
        customer: req.user._id,
        vendor: vendor._id,
        service: service._id,
        offering: offering._id,
        slotKey: inventory.slotKey,
        startTime: inventory.startTime,
        endTime: inventory.endTime,
        price: offering.price,
        currency: offering.currency,
        paymentMode,
        paymentStatus:
          paymentMode === "PAY_AFTER"
            ? "PENDING"
            : "PENDING",
        status: "PENDING",
        notes: notes || "",
      });

      const populatedBooking = await Booking.findById(
        booking._id
      )
        .populate("customer", "name email")
        .populate("vendor")
        .populate("service")
        .populate("offering");

      return res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: populatedBooking,
      });
    } catch (error) {
      await SlotInventory.updateOne(
        {
          _id: inventory._id,
          bookedCount: {
            $gt: 0,
          },
        },
        {
          $inc: {
            bookedCount: -1,
          },
        }
      );

      throw error;
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user._id,
    })
      .populate("vendor")
      .populate("service")
      .populate("offering")
      .sort({
        startTime: -1,
      });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    )
      .populate("customer", "name email")
      .populate("vendor")
      .populate("service")
      .populate("offering");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const isCustomer =
      booking.customer._id.toString() ===
      req.user._id.toString();

    const vendor = await Vendor.findOne({
      user: req.user._id,
    });

    const isVendor =
      vendor &&
      booking.vendor._id.toString() ===
        vendor._id.toString();

    if (!isCustomer && !isVendor) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this booking",
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getVendorBookings = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      user: req.user._id,
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    const bookings = await Booking.find({
      vendor: vendor._id,
    })
      .populate("customer", "name email")
      .populate("service")
      .populate("offering")
      .sort({
        startTime: 1,
      });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const confirmBooking = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      user: req.user._id,
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be confirmed",
      });
    }

    if (
      booking.paymentMode === "PAY_NOW" &&
      booking.paymentStatus !== "PAID"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is required before confirmation",
      });
    }

    booking.status = "CONFIRMED";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      data: booking,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const {
      reason,
    } = req.body;

    const vendor = await Vendor.findOne({
      user: req.user._id,
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be rejected",
      });
    }

    booking.status = "REJECTED";
    booking.rejectedAt = new Date();
    booking.cancellationReason = reason || "";

    await booking.save();

    await SlotInventory.updateOne(
      {
        slotKey: booking.slotKey,
        bookedCount: {
          $gt: 0,
        },
      },
      {
        $inc: {
          bookedCount: -1,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      data: booking,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const {
      reason,
    } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      !["PENDING", "CONFIRMED"].includes(
        booking.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Booking cannot be cancelled",
      });
    }

    booking.status = "CANCELLED";
    booking.cancellationReason = reason || "";
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();

    await booking.save();

    await SlotInventory.updateOne(
      {
        slotKey: booking.slotKey,
        bookedCount: {
          $gt: 0,
        },
      },
      {
        $inc: {
          bookedCount: -1,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const completeBooking = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      user: req.user._id,
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be completed",
      });
    }

    booking.status = "COMPLETED";
    booking.completedAt = new Date();

    if (
      booking.paymentMode === "PAY_AFTER"
    ) {
      booking.paymentStatus = "COLLECTED";
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking completed successfully",
      data: booking,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getVendorBookings,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
};