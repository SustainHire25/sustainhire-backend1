const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

require('dotenv').config();

const app = express();

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Middleware ---
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use("/api/auth", require("./routes/auth"));
app.use("/api/internship", require("./routes/internship"));

// --- Multer + Cloudinary Storage for direct uploads ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sustainhire_resumes",
    resource_type: "auto",  // automatically detect file type
    format: async (req, file) => file.originalname.split('.').pop() // keep original extension
  }
});
const upload = multer({ storage });

// --- Upload Route (optional direct upload endpoint) ---
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.status(200).json({ message: "File uploaded successfully", fileUrl: req.file.path });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
