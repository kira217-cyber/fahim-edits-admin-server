// backend/models/Hero.js
const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  video: { type: String, required: true }, // video filename
  headline: { type: String, required: true },
  subheadline: { type: String, required: true },
  buttonText: { type: String, default: "Share Idea" },
  buttonText2: { type: String, default: "Instant Reply" },
  buttonUrl: { type: String, default: "/contact" },
  instantButtonNumber: { type: String, default: "8801319242789" },
}, { timestamps: true });

module.exports = mongoose.model('Hero', heroSchema);