const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/bookings", require("./routes/bookingRoutes"));
// app.use("/api/payments", require("./routes/paymentRoutes"));
// app.use("/api/services", require("./routes/serviceRoutes"));
// app.use("/api/admin", require("./routes/adminRoutes"));
// app.use("/api/availability", require("./routes/availabilityRoutes"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

module.exports = app;