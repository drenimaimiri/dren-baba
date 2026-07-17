const express = require('express');
const multer = require('multer');
const path = require('path');
const Invitation = require('../models/Invitation');
const { auth } = require('../middleware/auth');

const router = express.Router();

const uploadDir = process.env.VERCEL === '1' ? '/tmp/uploads' : 'uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).substring(7) + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', auth, async (req, res) => {
  try {
    const invitations = await Invitation.find({ user: req.user._id }).populate('template');
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const invitations = await Invitation.find().populate('user', 'name email').populate('template');
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/public/:slug', async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ slug: req.params.slug }).populate('template');
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const data = req.body;
    const photos = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];

    const invitation = await Invitation.create({
      user: req.user._id,
      template: data.templateId,
      groomName: data.invitationType === 'kanagjegj' ? undefined : data.groomName,
      brideName: data.brideName,
      groomPhone: data.groomPhone || '',
      bridePhone: data.bridePhone || '',
      weddingDate: data.weddingDate,
      weddingTime: data.weddingTime,
      location: data.location,
      locationLat: data.locationLat || undefined,
      locationLng: data.locationLng || undefined,
      personalMessage: data.personalMessage || '',
      photos,
      customPrimaryColor: data.customPrimaryColor || '#D4AF37',
      customSecondaryColor: data.customSecondaryColor || '#FFF8E7',
      customFont: data.customFont || 'Georgia',
      customMp3Url: data.customMp3Url || '',
      invitationType: data.invitationType || 'dasem',
      language: data.language || 'sq',
      isPublished: data.isPublished === 'true'
    });

    res.status(201).json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ _id: req.params.id, user: req.user._id });
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });

    const fields = ['groomName', 'brideName', 'groomPhone', 'bridePhone', 'weddingDate', 'weddingTime', 'location', 'locationLat', 'locationLng', 'personalMessage', 'customPrimaryColor', 'customSecondaryColor', 'customFont', 'customMp3Url', 'template', 'invitationType', 'language', 'isPublished'];
    fields.forEach(f => { if (req.body[f] !== undefined) invitation[f] = req.body[f]; });

    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(f => '/uploads/' + f.filename);
      invitation.photos = [...invitation.photos, ...newPhotos];
    }

    await invitation.save();
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Invitation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Invitation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/rsvp', async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });

    invitation.rsvpList.push({
      name: req.body.name,
      email: req.body.email,
      attending: req.body.attending,
      guests: req.body.guests || 1,
      message: req.body.message || ''
    });

    await invitation.save();
    res.json({ message: 'RSVP submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/reset-music', auth, async (req, res) => {
  try {
    const result = await Invitation.updateMany(
      { user: req.user._id },
      { $set: { customMp3Url: '' } }
    );
    res.json({ message: `Muzika u kthye ne default per ${result.modifiedCount} ftesa.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/publish', auth, async (req, res) => {
  try {
    const invitation = await Invitation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isPublished: req.body.publish },
      { new: true }
    );
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
