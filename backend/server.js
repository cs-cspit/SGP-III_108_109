const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const dataRoutes = require('./routes/dataRoutes');

require("dotenv").config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // your frontend URLs
  credentials: true,
}));
// app.use(express.json({ extended: false }));

app.use(express.json());
app.use('/api', dataRoutes);
// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/portfolio", require("./routes/portfolioRoutes"));


const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));
