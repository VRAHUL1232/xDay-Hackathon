// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
const upload = multer();

// Middleware
app.use(cors());
app.use(express.json());
app.use(upload.none()); // For parsing multipart/form-data

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
