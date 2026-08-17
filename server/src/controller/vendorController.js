const Vendor = require("../models/vendors");
const User = require("../models/User");

const getMyVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      user: req.user._id,
    }).populate("approvedBy", "name email");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getPendingVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({
      approvalStatus: "PENDING",
    })
      .populate("user", "name email status createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate("user", "name email status")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate("user", "name email status")
      .populate("approvedBy", "name email");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateVendorProfile = async (req, res) => {
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

    if (vendor.approvalStatus === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Approved vendor profile cannot be changed through onboarding",
      });
    }

    const {
      businessName,
      phone,
      address,
      timezone,
      documents,
    } = req.body;

    if (businessName !== undefined) {
      vendor.businessName = businessName;
    }

    if (phone !== undefined) {
      vendor.contact.phone = phone;
    }

    if (address !== undefined) {
      vendor.address = address;
    }

    if (timezone !== undefined) {
      vendor.timezone = timezone;
    }

    if (documents !== undefined) {
      vendor.documents = documents;
    }

    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "Vendor profile updated",
      data: vendor,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateVendorStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be APPROVED or REJECTED",
      });
    }

    if (status === "REJECTED" && !reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    if (vendor.approvalStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Vendor application has already been processed",
      });
    }

    vendor.approvalStatus = status;

    if (status === "APPROVED") {
      vendor.approvedAt = new Date();
      vendor.approvedBy = req.user._id;
      vendor.rejectionReason = "";
    }

    if (status === "REJECTED") {
      vendor.rejectionReason = reason;
      vendor.approvedAt = null;
      vendor.approvedBy = null;
    }

    await vendor.save();

    await User.findByIdAndUpdate(vendor.user, {
      status: status === "APPROVED" ? "ACTIVE" : "REJECTED",
    });

    const updatedVendor = await Vendor.findById(vendor._id)
      .populate("user", "name email status")
      .populate("approvedBy", "name email");

    return res.status(200).json({
      success: true,
      message:
        status === "APPROVED"
          ? "Vendor approved successfully"
          : "Vendor rejected successfully",
      data: updatedVendor,
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
  getMyVendor,
  getPendingVendors,
  getAllVendors,
  getVendorById,
  updateVendorProfile,
  updateVendorStatus,
};