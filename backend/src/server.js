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

import { seed } from './seed.js';

app.use('/api/admin/seed', async (req, res) => {
  try {
    await seed();
    res.json({ ok: true, message: 'Database seeded successfully' });
  } catch (error) {
    console.error('SEED ERROR:', error);
    res.status(500).json({ error: 'Seed failed', message: error.message });
  }
});

app.post('/api/admin/clear-students', async (req, res) => {
  console.log('CLEAR STUDENTS ENDPOINT CALLED');
  try {
    const students = await Student.find({}, { authUserId: 1 }).lean();
    const linkedUserIds = students
      .map((student) => student.authUserId)
      .filter(Boolean);

    const [studentDeleteResult, linkedUsersDeleteResult, roleUsersDeleteResult] = await Promise.all([
      Student.deleteMany({}),
      linkedUserIds.length ? User.deleteMany({ _id: { $in: linkedUserIds } }) : Promise.resolve({ deletedCount: 0 }),
      User.deleteMany({ role: 'student' }),
    ]);

    const usersDeleted = Math.max(
      linkedUsersDeleteResult?.deletedCount || 0,
      roleUsersDeleteResult?.deletedCount || 0
    );

    console.log(`Deleted ${studentDeleteResult.deletedCount} students and ${usersDeleted} student users`);
    res.json({
      ok: true,
      message: `Deleted ${studentDeleteResult.deletedCount} students and ${usersDeleted} student users`,
      deleted: {
        students: studentDeleteResult.deletedCount,
        users: usersDeleted,
      },
    });
  } catch (error) {
    console.error('CLEAR STUDENTS ERROR:', error);
    res.status(500).json({ error: 'Clear failed', message: error.message });
  }
});

app.use('/api/auth', authRouter);
console.log('Auth router registered');
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
