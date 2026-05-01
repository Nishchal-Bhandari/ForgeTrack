import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './db.js';
import { Attendance } from './models/Attendance.js';
import { Material } from './models/Material.js';
import { Session } from './models/Session.js';
import { Student } from './models/Student.js';
import authRouter from './routes/auth.js';
import mentorRouter from './routes/mentor.js';
import studentRouter from './routes/student.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const clientOrigin = process.env.CLIENT_ORIGIN;

const defaultOrigins = ['http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5175', 'http://127.0.0.1:5175', 'http://localhost:5176', 'http://127.0.0.1:5176'];
const allowedOrigins = clientOrigin ? clientOrigin.split(',').map((v) => v.trim()) : defaultOrigins;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(
  cors({
    origin: true,  // Allow all origins temporarily for testing
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Test endpoint for CORS debugging
app.options('/api/test-cors', cors());
app.post('/api/test-cors', (_req, res) => {
  res.json({ ok: true, message: 'CORS working' });
});

app.get('/api/db-status', async (_req, res) => {
  const [students, sessions, attendance, materials] = await Promise.all([
    Student.countDocuments(),
    Session.countDocuments(),
    Attendance.countDocuments(),
    Material.countDocuments(),
  ]);

  res.json({
    ok: true,
    collections: {
      students,
      sessions,
      attendance,
      materials,
    },
  });
});

app.use('/api/auth', authRouter);
app.use('/api/mentor', mentorRouter);
app.use('/api/student', studentRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

async function start() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`ForgeTrack API running on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
