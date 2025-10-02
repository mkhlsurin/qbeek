import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Manager';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Manager'], default: 'Manager' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
