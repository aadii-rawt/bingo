const AvailabilityRule = require("../models/availabilityRule");
const AvailabilityException = require("../models/availabilityException");
const SlotInventory = require("../models/slotInventory");
const Service = require("../models/services");
const Offering = require("../models/offering");
const Vendor = require("../models/vendors");
const { DateTime } = require("luxon");

const validateWindows = (windows) => {
  if (!Array.isArray(windows)) {
    return false;
  }

  return windows.every((window) => {
    if (!window.start || !window.end) {
      return false;
    }

    return window.start < window.end;
  });
};

const getVendorService = async (userId, serviceId) => {
  const vendor = await Vendor.findOne({
    user: userId,
  });

  if (!vendor) {
    return {
      error: {
        status: 404,
        message: "Vendor profile not found",
      },
    };
  }

  if (vendor.approvalStatus !== "APPROVED") {
    return {
      error: {
        status: 403,
        message: "Vendor is not approved",
      },
    };
  }

  const service = await Service.findOne({
    _id: serviceId,
    vendor: vendor._id,
  });

  if (!service) {
    return {
      error: {
        status: 404,
        message: "Service not found",
      },
    };
  }

  return {
    vendor,
    service,
  };
};

const createAvailabilityRule = async (req, res) => {
  try {
    const {
      service,
      weekday,
      windows,
      capacity,
    } = req.body;

    if (
      !service ||
      weekday === undefined ||
      capacity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Service, weekday and capacity are required",
      });
    }

    if (weekday < 0 || weekday > 6) {
      return res.status(400).json({
        success: false,
        message: "Weekday must be between 0 and 6",
      });
    }

    if (!validateWindows(windows || [])) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability windows",
      });
    }

    const result = await getVendorService(
      req.user._id,
      service
    );

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      });
    }

    const existingRule = await AvailabilityRule.findOne({
      service,
      weekday,
    });

    if (existingRule) {
      return res.status(409).json({
        success: false,
        message:
          "Availability rule already exists for this weekday",
      });
    }

    const rule = await AvailabilityRule.create({
      service,
      vendor: result.vendor._id,
      weekday,
      windows: windows || [],
      capacity,
    });

    return res.status(201).json({
      success: true,
      message: "Availability rule created successfully",
      data: rule,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Availability rule already exists for this weekday",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getServiceAvailabilityRules = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const rules = await AvailabilityRule.find({
      service: serviceId,
    }).sort({
      weekday: 1,
    });

    return res.status(200).json({
      success: true,
      data: rules,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getMyAvailabilityRules = async (req, res) => {
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

    const rules = await AvailabilityRule.find({
      vendor: vendor._id,
    })
      .populate("service", "title slug status")
      .sort({
        weekday: 1,
      });

    return res.status(200).json({
      success: true,
      data: rules,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateAvailabilityRule = async (req, res) => {
  try {
    const {
      weekday,
      windows,
      capacity,
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

    const rule = await AvailabilityRule.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Availability rule not found",
      });
    }

    if (weekday !== undefined) {
      if (weekday < 0 || weekday > 6) {
        return res.status(400).json({
          success: false,
          message: "Weekday must be between 0 and 6",
        });
      }

      const duplicateRule = await AvailabilityRule.findOne({
        service: rule.service,
        weekday,
        _id: {
          $ne: rule._id,
        },
      });

      if (duplicateRule) {
        return res.status(409).json({
          success: false,
          message:
            "Availability rule already exists for this weekday",
        });
      }

      rule.weekday = weekday;
    }

    if (windows !== undefined) {
      if (!validateWindows(windows)) {
        return res.status(400).json({
          success: false,
          message: "Invalid availability windows",
        });
      }

      rule.windows = windows;
    }

    if (capacity !== undefined) {
      rule.capacity = capacity;
    }

    await rule.save();

    return res.status(200).json({
      success: true,
      message: "Availability rule updated successfully",
      data: rule,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteAvailabilityRule = async (req, res) => {
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

    const rule = await AvailabilityRule.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Availability rule not found",
      });
    }

    await AvailabilityRule.findByIdAndDelete(rule._id);

    return res.status(200).json({
      success: true,
      message: "Availability rule deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const createAvailabilityException = async (req, res) => {
  try {
    const {
      service,
      date,
      type,
      windows,
      reason,
    } = req.body;

    if (!service || !date || !type) {
      return res.status(400).json({
        success: false,
        message:
          "Service, date and type are required",
      });
    }

    if (!["CLOSED", "OPEN"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be CLOSED or OPEN",
      });
    }

    if (!validateWindows(windows || [])) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability windows",
      });
    }

    const result = await getVendorService(
      req.user._id,
      service
    );

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      });
    }

    const existingException =
      await AvailabilityException.findOne({
        service,
        date,
      });

    if (existingException) {
      return res.status(409).json({
        success: false,
        message:
          "Availability exception already exists for this date",
      });
    }

    const exception = await AvailabilityException.create({
      service,
      vendor: result.vendor._id,
      date,
      type,
      windows: windows || [],
      reason: reason || "",
    });

    return res.status(201).json({
      success: true,
      message:
        "Availability exception created successfully",
      data: exception,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Availability exception already exists for this date",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getServiceAvailabilityExceptions = async (
  req,
  res
) => {
  try {
    const { serviceId } = req.params;

    const exceptions = await AvailabilityException.find({
      service: serviceId,
    }).sort({
      date: 1,
    });

    return res.status(200).json({
      success: true,
      data: exceptions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getMyAvailabilityExceptions = async (
  req,
  res
) => {
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

    const exceptions =
      await AvailabilityException.find({
        vendor: vendor._id,
      })
        .populate("service", "title slug status")
        .sort({
          date: 1,
        });

    return res.status(200).json({
      success: true,
      data: exceptions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateAvailabilityException = async (
  req,
  res
) => {
  try {
    const {
      date,
      type,
      windows,
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

    const exception =
      await AvailabilityException.findOne({
        _id: req.params.id,
        vendor: vendor._id,
      });

    if (!exception) {
      return res.status(404).json({
        success: false,
        message: "Availability exception not found",
      });
    }

    if (date !== undefined) {
      const duplicate =
        await AvailabilityException.findOne({
          service: exception.service,
          date,
          _id: {
            $ne: exception._id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Availability exception already exists for this date",
        });
      }

      exception.date = date;
    }

    if (type !== undefined) {
      if (!["CLOSED", "OPEN"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Type must be CLOSED or OPEN",
        });
      }

      exception.type = type;
    }

    if (windows !== undefined) {
      if (!validateWindows(windows)) {
        return res.status(400).json({
          success: false,
          message: "Invalid availability windows",
        });
      }

      exception.windows = windows;
    }

    if (reason !== undefined) {
      exception.reason = reason;
    }

    await exception.save();

    return res.status(200).json({
      success: true,
      message:
        "Availability exception updated successfully",
      data: exception,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteAvailabilityException = async (
  req,
  res
) => {
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

    const exception =
      await AvailabilityException.findOne({
        _id: req.params.id,
        vendor: vendor._id,
      });

    if (!exception) {
      return res.status(404).json({
        success: false,
        message: "Availability exception not found",
      });
    }

    await AvailabilityException.findByIdAndDelete(
      exception._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Availability exception deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const generateSlots = async (req, res) => {
  try {
    const {
      service,
      offering,
      startDate,
      endDate,
    } = req.query;

    if (!service || !offering || !startDate) {
      return res.status(400).json({
        success: false,
        message: "Service, offering and startDate are required",
      });
    }

    const finalEndDate = endDate || startDate;

    const start = DateTime.fromISO(startDate, {
      zone: "Asia/Kolkata",
    });

    const end = DateTime.fromISO(finalEndDate, {
      zone: "Asia/Kolkata",
    });

    if (!start.isValid || !end.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "endDate cannot be before startDate",
      });
    }

    const serviceData = await Service.findById(service);

    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const offeringData = await Offering.findOne({
      _id: offering,
      service,
      isActive: true,
    });

    if (!offeringData) {
      return res.status(404).json({
        success: false,
        message: "Offering not found",
      });
    }

    const vendor = await Vendor.findById(serviceData.vendor);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    if (vendor.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Vendor is not approved",
      });
    }

    const timezone = "Asia/Kolkata";
    const now = DateTime.now().setZone(timezone);

    const slots = [];

    let currentDate = start.startOf("day");

    while (currentDate <= end.endOf("day")) {
      const date = currentDate.toFormat("yyyy-MM-dd");
      const weekday = currentDate.weekday % 7;

      const exception = await AvailabilityException.findOne({
        service,
        date,
      });

      let windows = [];
      let capacity = 1;

      if (exception) {
        if (exception.type === "CLOSED") {
          currentDate = currentDate.plus({
            days: 1,
          });

          continue;
        }

        if (exception.type === "OPEN") {
          windows = exception.windows;
        }

        const rule = await AvailabilityRule.findOne({
          service,
          weekday,
        });

        if (rule) {
          capacity = rule.capacity;
        }
      } else {
        const rule = await AvailabilityRule.findOne({
          service,
          weekday,
        });

        if (!rule) {
          currentDate = currentDate.plus({
            days: 1,
          });

          continue;
        }

        windows = rule.windows;
        capacity = rule.capacity;
      }

      for (const window of windows) {
        let slotStart = DateTime.fromFormat(
          `${date} ${window.start}`,
          "yyyy-MM-dd HH:mm",
          {
            zone: timezone,
          }
        );

        const windowEnd = DateTime.fromFormat(
          `${date} ${window.end}`,
          "yyyy-MM-dd HH:mm",
          {
            zone: timezone,
          }
        );

        while (
          slotStart.plus({
            minutes: offeringData.durationMinutes,
          }) <= windowEnd
        ) {
          const slotEnd = slotStart.plus({
            minutes: offeringData.durationMinutes,
          });

          if (slotStart > now) {
            const slotKey = [
              service,
              offering,
              slotStart.toFormat("yyyy-MM-dd-HH-mm"),
            ].join("_");

            const inventory =
              await SlotInventory.findOneAndUpdate(
                {
                  slotKey,
                },
                {
                  $setOnInsert: {
                    slotKey,
                    service,
                    offering,
                    vendor: vendor._id,
                    startTime: slotStart.toUTC().toJSDate(),
                    endTime: slotEnd.toUTC().toJSDate(),
                    capacity,
                    bookedCount: 0,
                  },
                },
                {
                  new: true,
                  upsert: true,
                }
              );

            if (
              inventory.bookedCount <
              inventory.capacity
            ) {
              slots.push({
                id: inventory._id,
                slotKey: inventory.slotKey,
                date,
                startTime: inventory.startTime,
                endTime: inventory.endTime,
                capacity: inventory.capacity,
                bookedCount: inventory.bookedCount,
                remaining:
                  inventory.capacity -
                  inventory.bookedCount,
              });
            }
          }

          slotStart = slotEnd;
        }
      }

      currentDate = currentDate.plus({
        days: 1,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        timezone,
        startDate,
        endDate: finalEndDate,
        slots,
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
module.exports = {
  createAvailabilityRule,
  getServiceAvailabilityRules,
  getMyAvailabilityRules,
  updateAvailabilityRule,
  deleteAvailabilityRule,
  createAvailabilityException,
  getServiceAvailabilityExceptions,
  getMyAvailabilityExceptions,
  updateAvailabilityException,
  deleteAvailabilityException,
  generateSlots
};