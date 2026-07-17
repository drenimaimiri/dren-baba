const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  groomName: { type: String, default: '', required: function() { return this.invitationType === 'dasem' || this.invitationType === 'syneti'; } },
  brideName: { type: String, default: '', required: function() { return this.invitationType !== 'syneti'; } },
  weddingDate: { type: Date, required: true },
  weddingTime: { type: String, required: true },
  location: { type: String, required: true },
  locationLat: { type: Number },
  locationLng: { type: Number },
  groomPhone: { type: String, default: '' },
  bridePhone: { type: String, default: '' },
  personalMessage: { type: String, default: '' },
  photos: [{ type: String }],
  customPrimaryColor: { type: String, default: '#D4AF37' },
  customSecondaryColor: { type: String, default: '#FFF8E7' },
  customFont: { type: String, default: 'Georgia' },
  customMp3Url: { type: String, default: '' },
  invitationType: { type: String, enum: ['dasem', 'kanagjegj', 'syneti'], default: 'dasem' },
  slug: { type: String, unique: true },
  isPublished: { type: Boolean, default: false },
  rsvpList: [{
    name: String,
    email: String,
    attending: { type: Boolean, default: true },
    guests: { type: Number, default: 1 },
    message: String
  }],
  createdAt: { type: Date, default: Date.now }
});

invitationSchema.pre('save', function (next) {
  if (!this.slug) {
    const random = Math.random().toString(36).substring(2, 8);
    let namePart;
    if (this.invitationType === 'syneti') {
      namePart = this.groomName || 'syneti';
    } else {
      namePart = this.groomName ? `${this.groomName}-${this.brideName}` : this.brideName;
    }
    this.slug = `${namePart}-${random}`
      .toLowerCase()
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Invitation', invitationSchema);
