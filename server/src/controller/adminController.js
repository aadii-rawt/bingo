const User = require("../models/user");
const Role = require("../models/role");
const Booking = require("../models/booking");
const Payment = require("../models/payment");

const getAdminDashboard = async (req, res) => {
  try {
    const vendorRole = await Role.findOne({
      slug: "VENDOR",
    });

    if (!vendorRole) {
      return res.status(404).json({
        success: false,
        message: "Vendor role not found",
      });
    }

    // Pending vendor applications
    const pendingVendors = await User.countDocuments({
      role: vendorRole._id,
      status: "PENDING",
    });
    // console.log("pen")

    // Today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const bookingsToday =
      await Booking.countDocuments({
        startTime: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      });

    // Revenue collected
    const revenueResult =
      await Payment.aggregate([
        {
          $match: {
            status: "SUCCESS",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const revenueCollected =
      revenueResult[0]?.total || 0;

    // Failed payments
    const paymentsFailed =
      await Payment.countDocuments({
        status: "FAILED",
      });

    return res.status(200).json({
      success: true,
      data: {
        pendingVendors,
        bookingsToday,
        revenueCollected,
        paymentsFailed,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getAdminBookings = async (
  req,
  res
) => {
  try {
    const {
      status,
      vendor,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    // Status filter

    if (status) {
      query.status = status;
    }

    // Vendor filter

    if (vendor) {
      query.vendor = vendor;
    }

    // Date range filter

    if (startDate || endDate) {
      query.startTime = {};

      if (startDate) {
        const start = new Date(
          startDate
        );

        start.setHours(
          0,
          0,
          0,
          0
        );

        query.startTime.$gte =
          start;
      }

      if (endDate) {
        const end = new Date(
          endDate
        );

        end.setHours(
          23,
          59,
          59,
          999
        );

        query.startTime.$lte =
          end;
      }
    }

    const bookings =
      await Booking.find(query)
        .populate(
          "customer",
          "name email"
        )
        .populate({
          path: "vendor",
          populate: {
            path: "user",
            select: "name email",
          },
        })
        .populate(
          "service",
          "title"
        )
        .populate(
          "offering",
          "name"
        )
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

const forceRejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Already terminal
    if (
      ["COMPLETED", "REJECTED", "CANCELLED", "NO_SHOW"].includes(
        booking.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a ${booking.status.toLowerCase()} booking`,
      });
    }

    booking.status = "REJECTED";
    booking.rejectedAt = new Date();

    // Reusing this field because your Booking
    // schema already has cancellationReason.
    booking.cancellationReason =
      reason.trim();

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking force rejected",
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
  getAdminDashboard,
  getAdminBookings,
  forceRejectBooking
};