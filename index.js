import emailRoutes from "./routes/email.js";

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const productImagesRoutes = require("./routes/productImages");

// Use routes
app.use("/api/email", emailRoutes);
app.use("/api/product-images", productImagesRoutes);

// Your other existing routes...
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
