import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User, { UserRole } from './models/User';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shambaiq';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users.');

    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
      {
        username: 'admin',
        passwordHash,
        role: UserRole.ADMIN,
        profileData: {
          name: 'System Admin',
          phone: '+254700000000',
        },
      },
      {
        username: 'officer',
        passwordHash,
        role: UserRole.OFFICER,
        profileData: {
          name: 'Agri Officer',
          county: 'Bomet',
          phone: '+254711111111',
        },
      },
      {
        username: 'farmer',
        passwordHash,
        role: UserRole.FARMER,
        profileData: {
          farmerId: 'f-001',
          name: 'Joseph Kiprono',
          county: 'Bomet',
          ward: 'Bomet Central',
          location: 'Kapkimolwa Farm',
          acres: 3.2,
          crop: 'Maize',
          phone: '+254722222222',
          lat: -0.7829,
          lon: 35.3447,
          timezone: 'Africa/Nairobi',
        },
      },
    ];

    await User.insertMany(users);
    console.log('Successfully seeded database with Admin, Officer, and Farmer.');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
