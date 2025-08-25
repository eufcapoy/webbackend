import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const getSupabaseClient = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase environment variables not found");
  }
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
};

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

router.post("/upload-image", upload.single("file"), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { file } = req;
    const { folder = "verification-documents" } = req.body;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("dermatologist-documents")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("dermatologist-documents").getPublicUrl(filePath);

    res.json({
      success: true,
      url: publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});
router.post(
  "/upload-profile-picture",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const supabase = getSupabaseClient();
      const { file } = req;
      const { userId } = req.body;

      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const fileExt = file.originalname.split(".").pop();
      const fileName = `profile_${userId}_${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("dermatologist-documents") // or create a separate bucket for profile pictures
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true, // Replace existing file if it exists
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("dermatologist-documents")
        .getPublicUrl(filePath);

      res.json({
        success: true,
        imageUrl: publicUrl,
        path: filePath,
      });
    } catch (error) {
      console.error("Profile picture upload error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);
export default router;
