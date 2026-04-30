import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true },
    topic: { type: String, required: true, trim: true },
    monthNumber: { type: Number, required: true },
    durationHours: { type: Number, default: 2 },
    sessionType: { type: String, default: 'offline', trim: true },
    notes: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

export const Session = mongoose.model('Session', sessionSchema);
