const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");

// Allowed admin emails
const adminEmails = [
  "2413711058009@mopvaishnav.ac.in",
  "2413711058012@mopvaishnav.ac.in",
  "2413711058024@mopvaishnav.ac.in"
];

// USER SIGNUP
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists Kindly login!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.json({ message: "User signed up successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error signing up" });
  }
});

// USER LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// ADMIN LOGIN
router.post("/admin", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!adminEmails.includes(email)) return res.status(403).json({ message: "Only admins can log in" });

    const adminUser = await User.findOne({ email });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new User({ email, password: hashedPassword, role: "admin" });
      await newAdmin.save();
      return res.json({ message: "Admin account created and logged in" });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    res.json({ message: "Admin login successful" });
  } catch (err) {
    res.status(500).json({ message: "Error logging in admin" });
  }
});

module.exports = router;
