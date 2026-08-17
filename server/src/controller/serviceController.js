const Service = require("../models/services");
const Vendor = require("../models/vendors");
const Category = require("../models/category");

const createSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const createService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "title and category are required",
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

    const categoryExists = await Category.findOne({
      _id: category,
      isActive: true,
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const slug = createSlug(title);

    const existingService = await Service.findOne({
      vendor: vendor._id,
      slug,
    });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message: "Service already exists",
      });
    }

    const service = await Service.create({
      vendor: vendor._id,
      category,
      title: title.trim(),
      slug,
      description: description?.trim() || "",
      isActive: true,
      status : "PUBLISHED"
    });

    const populatedService = await Service.findById(
      service._id
    )
      .populate("vendor")
      .populate("category");

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: populatedService,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Service already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getServices = async (req, res) => {
  try {
    const {
      category,
      vendor,
      search,
    } = req.query;

    const filter = {
      status: "PUBLISHED",
    };

    if (category) {
      filter.category = category;
    }

    if (vendor) {
      filter.vendor = vendor;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const services = await Service.find(filter)
      .populate("vendor")
      .populate("category")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getMyServices = async (req, res) => {
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
    })
      .populate("category")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("vendor")
      .populate("category");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateService = async (req, res) => {
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

    if (vendor.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Vendor is not approved",
      });
    }

    const service = await Service.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const {
      name,
      description,
      category,
      isActive,
    } = req.body;

    if (category !== undefined) {
      const categoryExists = await Category.findOne({
        _id: category,
        isActive: true,
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      service.category = category;
    }

    if (name !== undefined) {
      const newName = name.trim();
      const newSlug = createSlug(newName);

      const existingService = await Service.findOne({
        vendor: vendor._id,
        slug: newSlug,
        _id: {
          $ne: service._id,
        },
      });

      if (existingService) {
        return res.status(409).json({
          success: false,
          message: "Service already exists",
        });
      }

      service.name = newName;
      service.slug = newSlug;
    }

    if (description !== undefined) {
      service.description = description.trim();
    }

    if (isActive !== undefined) {
      service.isActive = isActive;
    }

    await service.save();

    const updatedService = await Service.findById(
      service._id
    )
      .populate("vendor")
      .populate("category");

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Service already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteService = async (req, res) => {
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

    const service = await Service.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    service.isActive = false;

    await service.save();

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
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
  createService,
  getServices,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
};