import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './db.js';
import { Attendance } from './models/Attendance.js';
import { Material } from './models/Material.js';
import { Session } from './models/Session.js';
import { Student } from './models/Student.js';
import { User } from './models/User.js';
import authRouter from './routes/auth.js';
import mentorRouter from './routes/mentor.js';
import studentRouter from './routes/student.js';
import messagesRouter from './routes/messages.js';
import announcementsRouter from './routes/announcements.js';
import attendanceImportRouter from './routes/attendanceImport.js';

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
    origin: allowedOrigins,
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


// POST /api/admin/purge-all
// Wipes ALL seeded/demo data from the live database.
// Protected by ADMIN_SECRET env variable — must match the header x-admin-secret.
app.post('/api/admin/purge-all', async (req, res) => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.headers['x-admin-secret'] !== secret) {
    return res.status(403).json({ error: 'Forbidden: invalid or missing admin secret' });
  }

  console.log('PURGE-ALL ENDPOINT CALLED — wiping all collections...');
  try {
    const [
      studentsResult,
      studentUsersResult,
      sessionsResult,
      attendanceResult,
      materialsResult,
    ] = await Promise.all([
      Student.deleteMany({}),
      User.deleteMany({ role: 'student' }),
      Session.deleteMany({}),
      Attendance.deleteMany({}),
      Material.deleteMany({}),
    ]);

    const summary = {
      students:    studentsResult.deletedCount,
      studentUsers: studentUsersResult.deletedCount,
      sessions:    sessionsResult.deletedCount,
      attendance:  attendanceResult.deletedCount,
      materials:   materialsResult.deletedCount,
    };

    console.log('PURGE-ALL complete:', summary);
    return res.json({ ok: true, message: 'All seed/demo data purged from database', deleted: summary });
  } catch (error) {
    console.error('PURGE-ALL ERROR:', error);
    return res.status(500).json({ error: 'Purge failed', message: error.message });
  }
});

app.use('/api/auth', authRouter);
console.log('Auth router registered');
app.use('/api/mentor/attendance-import', attendanceImportRouter);
console.log('Attendance Import router registered');
app.use('/api/mentor', mentorRouter);
console.log('Mentor router registered');
app.use('/api/student', studentRouter);
console.log('Student router registered');
app.use('/api/messages', messagesRouter);
console.log('Messages router registered');
app.use('/api/announcements', announcementsRouter);
console.log('Announcements router registered');


console.log('All routes registered');

app.use((_req, res) => {
  console.log('404 - Not found:', _req.method, _req.url);
  res.status(404).json({ error: 'Not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
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
