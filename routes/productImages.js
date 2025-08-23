const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for server-side operations
);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, callback) => {
    // Accept only image files
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed.")
      );
    }
  },
});

// Upload product images
router.post(
  "/upload/:productId",
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No files uploaded",
        });
      }

      console.log(`Uploading ${files.length} files for product ${productId}`);

      const imageUrls = [];
      const uploadPromises = files.map(async (file) => {
        try {
          // Generate unique filename
          const fileExtension = file.originalname.split(".").pop();
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileName = `${productId}_${timestamp}_${randomString}.${fileExtension}`;
          const filePath = `products/${fileName}`;

          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from("product-images")
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            console.error(`Upload error for ${file.originalname}:`, error);
            throw error;
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("product-images").getPublicUrl(filePath);

          return publicUrl;
        } catch (error) {
          console.error(`Failed to upload ${file.originalname}:`, error);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((url) => url !== null);

      console.log(
        `Successfully uploaded ${successfulUploads.length} out of ${files.length} files`
      );

      res.json({
        success: true,
        imageUrls: successfulUploads,
        uploadedCount: successfulUploads.length,
        totalCount: files.length,
      });
    } catch (error) {
      console.error("Upload endpoint error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error during upload",
      });
    }
  }
);

// Delete product images
router.delete("/delete", async (req, res) => {
  try {
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid or empty imageUrls array",
      });
    }

    console.log(`Deleting ${imageUrls.length} images`);

    // Extract file paths from URLs
    const filePaths = imageUrls
      .map((url) => {
        try {
          // Extract the file path from the Supabase URL
          const urlParts = new URL(url);
          const pathname = urlParts.pathname;
          // Remove the bucket path prefix to get just the file path
          const filePath = pathname.split("/product-images/")[1];
          return filePath;
        } catch (error) {
          console.error(`Invalid URL: ${url}`);
          return null;
        }
      })
      .filter((path) => path !== null);

    if (filePaths.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid file paths found",
      });
    }

    // Delete files from Supabase Storage
    const { data, error } = await supabase.storage
      .from("product-images")
      .remove(filePaths);

    if (error) {
      console.error("Supabase delete error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete images from storage",
      });
    }

    console.log(`Successfully deleted ${filePaths.length} images`);

    res.json({
      success: true,
      deletedCount: filePaths.length,
      message: "Images deleted successfully",
    });
  } catch (error) {
    console.error("Delete endpoint error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during deletion",
    });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Product images service is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
