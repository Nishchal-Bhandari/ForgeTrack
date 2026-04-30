import mongoose from 'mongoose';

let connectionPromise = null;

mongoose.set('strictQuery', true);

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not set');
    }

    connectionPromise = mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB || undefined,
      serverSelectionTimeoutMS: 10000,
    });
  }

  await connectionPromise;
  return mongoose.connection;
}
