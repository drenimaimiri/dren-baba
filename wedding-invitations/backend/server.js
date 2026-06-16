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

let cachedDb = null;
async function connectDb() {
  if (cachedDb) return cachedDb;
  await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = mongoose.connection;
  console.log('Connected to MongoDB');
  return cachedDb;
}

app.use('/api', async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed: ' + err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
