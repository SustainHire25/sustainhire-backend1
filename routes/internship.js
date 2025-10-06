const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const Internship = require('../models/internship');

require('dotenv').config();
const router = express.Router();

// --- Multer + Cloudinary Storage for resumes ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sustainhire_resumes",
    resource_type: "auto",
    format: async (req, file) => file.originalname.split('.').pop()
  }
});
const upload = multer({ storage });

// POST /api/internship/apply
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const data = req.body;
    const declaration = data.declaration === 'true' || data.declaration === 'on';

    const internship = new Internship({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      dob: new Date(data.dob),
      location: data.location,
      college: data.college,
      degree: data.degree,
      major: data.major,
      year: data.year,
      graduationYear: Number(data.graduationYear),
      role: data.role,
      startMonthYear: data.startMonthYear,
      duration: data.duration,
      locationPref: data.locationPref,
      skills: data.skills || "",
      experience: data.experience || "",
      resume: req.file ? req.file.path : "", // Cloudinary URL
      whyInternship: data.whyInternship || "",
      careerGoals: data.careerGoals || "",
      areasOfInterest: data.areasOfInterest || "",
      linkedin: data.linkedin || "",
      portfolio: data.portfolio || "",
      comments: data.comments || "",
      declaration
    });

    await internship.save();

    res.status(201).json({
      message: "Application submitted successfully! Kindly refer your email for further details!"
    });
  } catch (err) {
    console.error("Error saving application:", err);
    res.status(500).json({ error: "Error saving application", details: err.message });
  }
});

module.exports = router;
