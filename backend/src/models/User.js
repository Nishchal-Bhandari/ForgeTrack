import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['mentor', 'student'] },
    displayName: { type: String, required: true },
    studentId: { type: Number, default: null },
    studentUsn: { type: String, default: null, unique: true, sparse: true, uppercase: true, trim: true },
    mustChangePassword: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
