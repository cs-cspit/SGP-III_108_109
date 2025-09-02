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
  origin: 'http://localhost:5173', // your frontend URL
  credentials: true,
}));
// app.use(express.json({ extended: false }));

app.use(express.json());
app.use('/api', dataRoutes);
// Routes
app.use("/api/auth", require("./routes/authRoutes"));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
