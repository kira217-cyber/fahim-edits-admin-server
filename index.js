const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");


dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static("uploads")); // ভিডিও ফাইল সার্ভ করার জন্য

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Routes
const contactRoutes = require("./routes/contactRoutes");
const heroRoutes = require("./routes/heroRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/admin", adminRoutes); 
app.use("/api/contact", contactRoutes);
app.use("/api/hero", heroRoutes);




// Default Route
app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; margin-top: 100px;">
      <h1 style="color: #4E8EFF;">Backend API Running!</h1>
      <p><code>POST /api/contact</code> → Submit Form</p>
      <p><code>GET /api/contact/admin</code> → View All Messages</p>
    </div>
  `);
});

module.exports = app;

// Local Server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5005;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}