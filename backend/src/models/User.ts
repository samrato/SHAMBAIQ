import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  FARMER = 'farmer',
  OFFICER = 'officer',
  ADMIN = 'admin',
}

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  role: UserRole;
  profileData?: {
    farmerId?: string;
    name?: string;
    county?: string;
    ward?: string;
    location?: string;
    acres?: number;
    crop?: string;
    phone?: string;
    lat?: number;
    lon?: number;
    timezone?: string;
  };
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.FARMER },
  profileData: {
    farmerId: String,
    name: String,
    county: String,
    ward: String,
    location: String,
    acres: Number,
    crop: String,
    phone: String,
    lat: Number,
    lon: Number,
    timezone: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
