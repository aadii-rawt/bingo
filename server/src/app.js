const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const serviceRoutes = require("./routes/serviceRoutes");

const offeringRoutes = require("./routes/offeringRoutes");

const availabilityRoutes = require("./routes/availabilityRoutes");

const bookingRoutes = require("./routes/bookingRoutes");

const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const connectDB = require("./config/db");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/offerings", offeringRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/services", serviceRoutes);

app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
connectDB()

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

module.exports = app;