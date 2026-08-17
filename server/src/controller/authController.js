const crypto = require("crypto");

const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const RefreshToken = require("../models/RefreshToken");
const Vendor = require("../models/vendors");

const {
  hashPassword,
  comparePassword,
} = require("../utils/password");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/token");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const createTokens = async (user) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
  };
};

const registerCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const customerRole = await Role.findOne({
      slug: "CUSTOMER",
    });

    if (!customerRole) {
      return res.status(500).json({
        success: false,
        message: "Customer role not configured",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: customerRole._id,
      status: "ACTIVE",
    });

    const tokens = await createTokens(user);

    setRefreshTokenCookie(res, tokens.refreshToken);

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
          role: "CUSTOMER",
        },
        accessToken: tokens.accessToken,
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

const registerVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      businessName,
      phone,
      address,
      timezone,
      documents,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !businessName ||
      !phone ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, business name, phone and address are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const vendorRole = await Role.findOne({
      slug: "VENDOR",
    });

    if (!vendorRole) {
      return res.status(500).json({
        success: false,
        message: "Vendor role not configured",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: vendorRole._id,
      status: "PENDING",
    });

    await Vendor.create({
      user: user._id,
      businessName,
      contact: {
        phone,
        email: normalizedEmail,
      },
      address,
      timezone: timezone || "Asia/Kolkata",
      documents: documents || [],
      approvalStatus: "PENDING",
    });

    const tokens = await createTokens(user);

    setRefreshTokenCookie(res, tokens.refreshToken);

    return res.status(201).json({
      success: true,
      message: "Vendor application submitted",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
          role: "VENDOR",
        },
        accessToken: tokens.accessToken,
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    })
      .select("+password")
      .populate({
        path: "role",
        populate: {
          path: "permissions",
        },
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await comparePassword(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended",
      });
    }

    if (user.status === "REJECTED") {
      return res.status(403).json({
        success: false,
        message: "Your account has been rejected",
      });
    }

    user.lastLoginAt = new Date();

    await user.save();

    const tokens = await createTokens(user);

    setRefreshTokenCookie(res, tokens.refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
          role: user.role.slug,
          permissions: user.role.isSuperAdmin
            ? ["*"]
            : user.role.permissions.map(
                (permission) => permission.slug
              ),
        },
        accessToken: tokens.accessToken,
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

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const payload = verifyRefreshToken(refreshToken);

    const tokenHash = hashToken(refreshToken);

    const storedToken = await RefreshToken.findOne({
      tokenHash,
      user: payload.userId,
      revokedAt: null,
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    storedToken.revokedAt = new Date();

    await storedToken.save();

    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    if (
      user.status === "SUSPENDED" ||
      user.status === "REJECTED"
    ) {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    const tokens = await createTokens(user);

    setRefreshTokenCookie(res, tokens.refreshToken);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await RefreshToken.findOneAndUpdate(
        {
          tokenHash: hashToken(refreshToken),
        },
        {
          revokedAt: new Date(),
        }
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "role",
      populate: {
        path: "permissions",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role.slug,
        permissions: user.role.isSuperAdmin
          ? ["*"]
          : user.role.permissions.map(
              (permission) => permission.slug
            ),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  registerCustomer,
  registerVendor,
  login,
  refreshAccessToken,
  logout,
  getMe,
};