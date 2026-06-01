const express = require('express');
const User = require('../models/User');
const Template = require('../models/Template');
const Invitation = require('../models/Invitation');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(auth, adminOnly);

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Invitation.deleteMany({ user: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInvitations = await Invitation.countDocuments();
    const publishedInvitations = await Invitation.countDocuments({ isPublished: true });
    const totalTemplates = await Template.countDocuments();
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const recentInvitations = await Invitation.find()
      .populate('user', 'name email')
      .populate('template', 'name')
      .sort({ createdAt: -1 }).limit(5);

    res.json({ totalUsers, totalInvitations, publishedInvitations, totalTemplates, recentUsers, recentInvitations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
