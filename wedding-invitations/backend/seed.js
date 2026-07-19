require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');
const User = require('./models/User');

const templates = [
  {
    name: 'Romantic Blush',
    description: 'Nuanca të buta rozë për një atmosferë romantike',
    primaryColor: '#E8A87C',
    secondaryColor: '#FFF5F0',
    font: 'Parisienne',
    style: 'romantic',
    thumbnail: '/templates/romantic-blush.jpg'
  },
  {
    name: 'Minimal Luxe',
    description: 'Elegancë minimaliste me prekje luksi',
    primaryColor: '#C4956A',
    secondaryColor: '#FAFAF7',
    font: 'Lora',
    style: 'minimal',
    thumbnail: '/templates/minimal-luxe.jpg'
  },
  {
    name: 'Classic Elegance',
    description: 'Stil klasik dhe i përjetshëm për çdo rast',
    primaryColor: '#D4AF37',
    secondaryColor: '#FFF8E7',
    font: 'Playfair Display',
    style: 'classic',
    thumbnail: '/templates/classic-elegance.jpg'
  },
  {
    name: 'Modern Romance',
    description: 'Dizajn modern për çifte bashkëkohore',
    primaryColor: '#B8976A',
    secondaryColor: '#FDF8F3',
    font: 'Cinzel',
    style: 'modern',
    thumbnail: '/templates/modern-romance.jpg'
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
