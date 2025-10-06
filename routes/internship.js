const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Internship = require('../models/internship');

const router = express.Router();

// Multer storage for resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Replace @ and . with _ for folder name
    const emailSafe = req.body.email ? req.body.email.replace(/[@.]/g, '_') : 'anonymous';
    const folder = path.join(__dirname, '..', 'uploads', emailSafe);

    // Create folder if it doesn't exist
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// POST /api/internship/apply
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const data = req.body;

    // Convert checkbox value to boolean
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
      resume: req.file ? req.file.path : "",
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
