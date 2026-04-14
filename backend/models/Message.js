const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  company: {
    type: String,
    trim: true,
    default: ''
  },
  subject: {
    type: String,
    enum: [
      'Architecture Consultation',
      'Project Inquiry',
      'Open Source Collaboration',
      'Partnership Inquiry',
      'Freelance Partnership',
      'Full-time Role Inquiry',
      'General Editorial Feedback',
      'Architectural Consulting',
      'Speaking Engagement',
      'General Networking',
      'System Architecture Consultation',
      'Other'
    ],
    default: 'Project Inquiry'
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  read: {
    type: Boolean,
    default: false
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Message', messageSchema);
