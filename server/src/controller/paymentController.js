const Payment = require("../models/payment");
const Booking = require("../models/booking");

const createPayment = async (req, res) => {
  try {
    const {
      booking,
      idempotencyKey,
    } = req.body;

    if (!booking || !idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "Booking and idempotency key are required",
      });
    }

    const bookingData = await Booking.findOne({
      _id: booking,
      customer: req.user._id,
    });

    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (bookingData.paymentMode !== "PAY_NOW") {
      return res.status(400).json({
        success: false,
        message: "This booking does not require immediate payment",
      });
    }

    if (
      ["CANCELLED", "REJECTED"].includes(
        bookingData.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment cannot be created for this booking",
      });
    }

    const existingPayment = await Payment.findOne({
      idempotencyKey,
    });

    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: "Payment already exists",
        data: existingPayment,
      });
    }

    const successfulPayment = await Payment.findOne({
      booking: bookingData._id,
      status: "SUCCESS",
    });

    if (successfulPayment) {
      return res.status(409).json({
        success: false,
        message: "Booking is already paid",
      });
    }

    const payment = await Payment.create({
      booking: bookingData._id,
      customer: req.user._id,
      amount: bookingData.price,
      currency: bookingData.currency,
      mode: "PAY_NOW",
      status: "INITIATED",
      idempotencyKey,
    });

    return res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      data: payment,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      const payment = await Payment.findOne({
        idempotencyKey: req.body.idempotencyKey,
      });

      return res.status(200).json({
        success: true,
        message: "Payment already exists",
        data: payment,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      customer: req.user._id,
    })
      .populate("booking")
      .populate("customer", "name email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const paymentSuccess = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "SUCCESS") {
      return res.status(200).json({
        success: true,
        message: "Payment already successful",
        data: payment,
      });
    }

    if (payment.status !== "INITIATED") {
      return res.status(400).json({
        success: false,
        message: "Payment cannot be completed",
      });
    }

    const providerReference =
      req.body.providerReference ||
      `MOCK_${Date.now()}`;

    payment.status = "SUCCESS";
    payment.providerReference = providerReference;
    payment.paidAt = new Date();

    await payment.save();

    const booking = await Booking.findById(
      payment.booking
    );

    if (booking) {
      booking.paymentStatus = "PAID";

      await booking.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment successful",
      data: payment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const paymentFailed = async (req, res) => {
  try {
    const {
      reason,
    } = req.body;

    const payment = await Payment.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "Successful payment cannot be marked as failed",
      });
    }

    payment.status = "FAILED";
    payment.failureReason =
      reason || "Payment failed";

    await payment.save();

    const booking = await Booking.findById(
      payment.booking
    );

    if (booking) {
      booking.paymentStatus = "FAILED";

      await booking.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment marked as failed",
      data: payment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(
      req.params.id
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "Only successful payments can be refunded",
      });
    }

    payment.status = "REFUNDED";
    payment.refundedAt = new Date();

    await payment.save();

    const booking = await Booking.findById(
      payment.booking
    );

    if (booking) {
      booking.paymentStatus = "REFUNDED";

      await booking.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      data: payment,
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
  createPayment,
  getPaymentById,
  paymentSuccess,
  paymentFailed,
  refundPayment,
};