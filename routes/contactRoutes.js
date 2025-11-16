const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

// Nodemailer Transporter (একবারই তৈরি করো)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST: Submit Contact Form
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    // Validation (অতিরিক্ত চেক)
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // Save to MongoDB
    const newContact = new Contact({
      firstName,
      lastName,
      email,
      subject,
      message,
    });
    await newContact.save();

    // Send Email to Admin
    const mailOptions = {
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #333;">New Contact Message</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p style="background: white; padding: 15px; border-left: 4px solid #4E8EFF;">
            ${message.replace(/\n/g, "<br/>")}
          </p>
          <br>
          <small>Sent on: ${new Date().toLocaleString()}</small>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact Form Error:", error);
    res.status(500).json({ error: "Failed to send message. Please try again." });
  }
});

// GET: All Contacts (Admin Panel এর জন্য)
router.get("/admin", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// PATCH: Mark as Read/Replied
router.patch("/:id", async (req, res) => {
  try {
    const { isRead, replied } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead, replied },
      { new: true }
    );
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;