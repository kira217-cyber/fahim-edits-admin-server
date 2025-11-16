// backend/routes/heroRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Hero = require("../models/Hero");

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/hero/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "hero-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /mp4|webm|ogg/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error("Only video files are allowed!"));
  },
});

// GET Hero Data
router.get("/", async (req, res) => {
  try {
    const hero = await Hero.findOne().sort({ createdAt: -1 });
    if (!hero) return res.status(404).json({ message: "No hero data" });
    res.json(hero);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Create First Hero
router.post("/", upload.single("video"), async (req, res) => {
  try {
    const {
      headline,
      subheadline,
      buttonText,
      buttonText2,
      buttonUrl,
      instantButtonNumber,
    } = req.body;
    const video = req.file ? req.file.filename : null;

    if (!video)
      return res
        .status(400)
        .json({ error: "Video is required for first upload" });

    const existing = await Hero.findOne();
    if (existing)
      return res
        .status(400)
        .json({ error: "Hero already exists. Use PUT to update." });

    const hero = new Hero({
      video,
      headline,
      subheadline,
      buttonText,
      buttonText2,
      buttonUrl,
      instantButtonNumber,
    });

    await hero.save();
    res.status(201).json(hero);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update Hero
router.put("/", upload.single("video"), async (req, res) => {
  try {
    const {
      headline,
      subheadline,
      buttonText,
      buttonText2,
      buttonUrl,
      instantButtonNumber,
      deleteVideo,
    } = req.body;

    const hero = await Hero.findOne();
    if (!hero) return res.status(404).json({ error: "No hero data to update" });

    const updateData = {
      headline: headline || hero.headline,
      subheadline: subheadline || hero.subheadline,
      buttonText: buttonText || hero.buttonText,
      buttonText2: buttonText2 || hero.buttonText2,
      buttonUrl: buttonUrl || hero.buttonUrl,
      instantButtonNumber: instantButtonNumber || hero.instantButtonNumber,
    };

    // If deleteVideo flag is sent and no new file
    if (deleteVideo === "true" && !req.file) {
      if (hero.video) {
        const oldPath = path.join(__dirname, "../uploads/hero/", hero.video);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.video = null;
    }

    // If new file uploaded
    if (req.file) {
      if (hero.video) {
        const oldPath = path.join(__dirname, "../uploads/hero/", hero.video);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.video = req.file.filename;
    }

    const updatedHero = await Hero.findOneAndUpdate({}, updateData, {
      new: true,
    });
    res.json(updatedHero);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Remove Hero Data (Optional)
router.delete("/", async (req, res) => {
  try {
    const hero = await Hero.findOne();
    if (!hero) return res.status(404).json({ error: "No hero to delete" });

    if (hero.video) {
      const videoPath = path.join(__dirname, "../uploads/hero/", hero.video);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    }

    await Hero.deleteOne({});
    res.json({ message: "Hero deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
