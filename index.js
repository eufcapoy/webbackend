import dotenv from "dotenv";

// Load environment variables FIRST, before importing other modules
dotenv.config();

// Debug: Check if BREVO_API_KEY is loaded after dotenv.config()
console.log(
  "After dotenv.config() - BREVO API KEY:",
  process.env.BREVO_API_KEY ? "Loaded ✅" : "Missing ❌"
);
console.log(
  "SUPABASE URL:",
  process.env.SUPABASE_URL ? "Loaded ✅" : "Missing ❌"
);
import express from "express";
import cors from "cors";

import emailRoutes from "./routes/email.js";
import productImagesRoutes from "./routes/productImages.js";
import verificationRoutes from "./routes/userimages.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/email", emailRoutes);
app.use("/api/product-images", productImagesRoutes);
app.use("/api/user-images", verificationRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
