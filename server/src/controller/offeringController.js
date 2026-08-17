const Offering = require("../models/offering");
const Service = require("../models/services");
const Vendor = require("../models/vendors");

const createOffering = async (req, res) => {
  try {
    const {
      service,
      name,
      durationMinutes,
      price,
      currency,
    } = req.body;

    if (
      !service ||
      !name ||
      durationMinutes === undefined ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Service, name, duration, and price are required",
      });
    }

    const vendor = await Vendor.findOne({
      user: req.user._id,
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    if (vendor.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Vendor is not approved",
      });
    }

    const serviceExists = await Service.findOne({
      _id: service,
      vendor: vendor._id,
      status: "PUBLISHED",
    });

    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const offering = await Offering.create({
      service,
      name: name.trim(),
      durationMinutes,
      price,
      currency: currency || "INR",
      isActive: true,
    });

    const populatedOffering = await Offering.findById(
      offering._id
    ).populate({
      path: "service",
      populate: [
        {
          path: "vendor",
        },
        {
          path: "category",
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Offering created successfully",
      data: populatedOffering,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



const getOfferings = async (req, res) => {
  try {
    const {
      service,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (service) {
      filter.service = service;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (
      minDuration !== undefined ||
      maxDuration !== undefined
    ) {
      filter.durationMinutes = {};

      if (minDuration !== undefined) {
        filter.durationMinutes.$gte = Number(minDuration);
      }

      if (maxDuration !== undefined) {
        filter.durationMinutes.$lte = Number(maxDuration);
      }
    }

    const offerings = await Offering.find(filter)
      .populate({
        path: "service",
        populate: [
          {
            path: "vendor",
          },
          {
            path: "category",
          },
        ],
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      data: offerings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getMyOfferings = async (req, res) => {
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

    const services = await Service.find({
      vendor: vendor._id,
    }).select("_id");

    const serviceIds = services.map(
      (service) => service._id
    );

    const offerings = await Offering.find({
      service: {
        $in: serviceIds,
      },
    })
      .populate("service")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      data: offerings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getOfferingById = async (req, res) => {
  try {
    const offering = await Offering.findById(
      req.params.id
    ).populate({
      path: "service",
      populate: [
        {
          path: "vendor",
        },
        {
          path: "category",
        },
      ],
    });

    if (!offering) {
      return res.status(404).json({
        success: false,
        message: "Offering not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: offering,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



const getOfferingsByService = async (
  req,
  res
) => {
  try {
    const { serviceId } = req.params;

    const offerings = await Offering.find({
      service: serviceId,
      isActive: true,
    }).populate({
      path: "service",
      populate: [
        {
          path: "vendor",
        },
        {
          path: "category",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: offerings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const updateOffering = async (req, res) => {
  try {
    const {
      name,
      durationMinutes,
      price,
      currency,
      isActive,
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

    if (vendor.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Vendor is not approved",
      });
    }

    const services = await Service.find({
      vendor: vendor._id,
    }).select("_id");

    const serviceIds = services.map(
      (service) => service._id
    );

    const offering = await Offering.findOne({
      _id: req.params.id,
      service: {
        $in: serviceIds,
      },
    });

    if (!offering) {
      return res.status(404).json({
        success: false,
        message: "Offering not found",
      });
    }

    if (name !== undefined) {
      offering.name = name.trim();
    }

    if (durationMinutes !== undefined) {
      offering.durationMinutes = durationMinutes;
    }

    if (price !== undefined) {
      offering.price = price;
    }

    if (currency !== undefined) {
      offering.currency = currency;
    }

    if (isActive !== undefined) {
      offering.isActive = isActive;
    }

    await offering.save();

    const updatedOffering = await Offering.findById(
      offering._id
    ).populate({
      path: "service",
      populate: [
        {
          path: "vendor",
        },
        {
          path: "category",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Offering updated successfully",
      data: updatedOffering,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteOffering = async (req, res) => {
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

    const services = await Service.find({
      vendor: vendor._id,
    }).select("_id");

    const serviceIds = services.map(
      (service) => service._id
    );

    const offering = await Offering.findOne({
      _id: req.params.id,
      service: {
        $in: serviceIds,
      },
    });

    if (!offering) {
      return res.status(404).json({
        success: false,
        message: "Offering not found",
      });
    }

    offering.isActive = false;

    await offering.save();

    return res.status(200).json({
      success: true,
      message: "Offering deleted successfully",
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
  createOffering,
  getOfferings,
  getMyOfferings,
  getOfferingById,
  updateOffering,
  deleteOffering,
  getOfferingsByService
};