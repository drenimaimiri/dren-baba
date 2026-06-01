const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  thumbnail: String,
  primaryColor: { type: String, default: '#D4AF37' },
  secondaryColor: { type: String, default: '#FFF8E7' },
  font: { type: String, default: 'Georgia' },
  style: { type: String, enum: ['classic', 'modern', 'romantic', 'minimal'], default: 'classic' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', templateSchema);
