require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const templateRoutes = require('./routes/templates');
const invitationRoutes = require('./routes/invitations');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());
const uploadsDir = process.env.VERCEL === '1' ? '/tmp/uploads' : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  const mongoUri = process.env.MONGODB_URI || '(not set)';
  res.json({ status: 'ok', mongoUri: mongoUri.substring(0, 40) + '...', mongooseState: mongoose.connection.readyState, timestamp: new Date().toISOString() });
});

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000, bufferTimeoutMS: 30000 })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const PORT = process.env.PORT || 5000;
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
