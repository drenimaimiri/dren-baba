require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');
const User = require('./models/User');

const templates = [
  {
    name: 'Classic Elegance',
    description: 'Një dizajn klasik dhe elegant me ngjyra ari dhe të bardha',
    primaryColor: '#D4AF37',
    secondaryColor: '#FFF8E7',
    font: 'Georgia',
    style: 'classic',
    thumbnail: '/templates/classic.jpg'
  },
  {
    name: 'Modern Romance',
    description: 'Dizajn modern me linja të pastra dhe romantike',
    primaryColor: '#C9A96E',
    secondaryColor: '#FAF5EF',
    font: 'Playfair Display',
    style: 'modern',
    thumbnail: '/templates/modern.jpg'
  },
  {
    name: 'Romantic Blush',
    description: 'Stil romantik me nuanca rozë dhe të arta',
    primaryColor: '#D4AF37',
    secondaryColor: '#FDE8E8',
    font: 'Great Vibes',
    style: 'romantic',
    thumbnail: '/templates/romantic.jpg'
  },
  {
    name: 'Minimal Luxe',
    description: 'Minimalizëm luksoz për çifte moderne',
    primaryColor: '#B8860B',
    secondaryColor: '#F5F5DC',
    font: 'Lora',
    style: 'minimal',
    thumbnail: '/templates/minimal.jpg'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Template.deleteMany({});
    await Template.insertMany(templates);
    console.log('Templates seeded successfully');

    const adminExists = await User.findOne({ email: 'admin@wedding.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@wedding.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created (admin@wedding.com / admin123)');
    }

    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
