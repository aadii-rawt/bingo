const express = require("express");

const {
    authenticate,
} = require("../middleware/authMiddleware");

const { registerCustomer,
    registerVendor,
    login,
    refreshAccessToken,
    logout,
    getMe, } = require("../controller/authController");

const router = express.Router();

router.post("/register/customer", registerCustomer);

router.post("/register/vendor", registerVendor);

router.post("/login", login);

router.post("/refresh", refreshAccessToken);

router.post("/logout", logout);

router.get("/me", authenticate, getMe);

module.exports = router;