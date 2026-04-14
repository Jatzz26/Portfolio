require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter for the contact form (max 10 submissions per 15 mins per IP)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many requests. Please wait before trying again.' }
});

// ─── Static Files ─────────────────────────────────────────────────────────────
// Serve the portfolio HTML pages
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serve public assets (CV, images, etc.)
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/admin', adminRoutes);

// CV Download route
app.get('/cv', (req, res) => {
  const cvPath = path.join(__dirname, '..', 'public', 'cv.pdf');
  res.download(cvPath, 'Jatin_Pathak_CV.pdf', (err) => {
    if (err) {
      console.warn('[CV] File not found, serving placeholder response.');
      res.status(404).json({
        success: false,
        error: 'CV not yet uploaded. Please check back later.'
      });
    }
  });
});

// Explicit page routes (for clean URLs)
app.get('/',            (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'home.html')));
app.get('/home',        (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'home.html')));
app.get('/experience',  (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'experience.html')));
app.get('/projects',    (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'project.html')));
app.get('/about',       (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'about_contact.html')));
app.get('/connect',     (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'connect.html')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED'
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'frontend', 'home.html'));
});

// ─── Database + Server Start ──────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('\x1b[36m%s\x1b[0m', '▶  MongoDB connected:', MONGODB_URI);
    app.listen(PORT, () => {
      console.log('\x1b[36m%s\x1b[0m', `▶  Portfolio server running at http://localhost:${PORT}`);
      console.log('\x1b[90m%s\x1b[0m', `   Admin dashboard: http://localhost:${PORT}/admin?token=${process.env.ADMIN_TOKEN}`);
      console.log('\x1b[90m%s\x1b[0m', `   Health check:    http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('\x1b[31m%s\x1b[0m', '✗  MongoDB connection failed:', err.message);
    console.error('\x1b[33m%s\x1b[0m', '  Make sure MongoDB is running: mongod');
    process.exit(1);
  });
