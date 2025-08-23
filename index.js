import dotenv from "dotenv";

// Load environment variables FIRST, before importing other modules
dotenv.config();

import express from "express";
import cors from "cors";

import emailRoutes from "./routes/email.js";
import productImagesRoutes from "./routes/productImages.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/email", emailRoutes);
app.use("/api/product-images", productImagesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
