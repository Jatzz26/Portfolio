const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const nodemailer = require('nodemailer');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, company, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required.'
      });
    }

    // Save to DB
    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company ? company.trim() : '',
      subject: subject || 'Project Inquiry',
      message: message.trim(),
      ipAddress: req.ip || ''
    });

    // Optional: Send email notification
    if (process.env.SEND_EMAIL_NOTIFICATIONS === 'true' && process.env.EMAIL_USER) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
          to: process.env.NOTIFICATION_EMAIL,
          subject: `[Portfolio] New message from ${name} — ${subject}`,
          html: `
            <div style="font-family: monospace; background: #0d0e10; color: #fdfbfe; padding: 24px; border-left: 3px solid #69daff;">
              <h2 style="color: #69daff; margin-bottom: 16px;">NEW CONNECTION REQUEST</h2>
              <p><strong style="color:#ababad">NAME:</strong> ${name}</p>
              <p><strong style="color:#ababad">EMAIL:</strong> ${email}</p>
              <p><strong style="color:#ababad">COMPANY:</strong> ${company || 'N/A'}</p>
              <p><strong style="color:#ababad">SUBJECT:</strong> ${subject}</p>
              <hr style="border-color: #47484a; margin: 16px 0;" />
              <p><strong style="color:#ababad">MESSAGE:</strong></p>
              <p style="white-space: pre-wrap; color: #fdfbfe;">${message}</p>
              <hr style="border-color: #47484a; margin: 16px 0;" />
              <p style="font-size: 11px; color:#555">Received at: ${new Date().toISOString()}</p>
              <a href="${req.protocol}://${req.get('host')}/admin" style="color:#69daff">View Admin Dashboard →</a>
            </div>
          `
        });
      } catch (emailErr) {
        console.warn('[Email] Notification failed (non-fatal):', emailErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Message received. Transmission confirmed.',
      id: newMessage._id
    });

  } catch (err) {
    console.error('[Contact] Error saving message:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;
