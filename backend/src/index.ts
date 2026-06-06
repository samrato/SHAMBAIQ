import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import weatherRoutes from './routes/weatherRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shambaiq';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);

app.get('/', (req, res) => {
  res.send('ShambaIQ API is running...');
});

const connectDatabase = async () => {
  for (;;) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
      return;
    } catch (err) {
      console.error('MongoDB connection error, retrying in 5 seconds:', err);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

connectDatabase();
