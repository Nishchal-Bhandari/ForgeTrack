import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDatabase } from './db.js';
import { User } from './models/User.js';
import { Student } from './models/Student.js';
import { Session } from './models/Session.js';
import { Attendance } from './models/Attendance.js';
import { Material } from './models/Material.js';

dotenv.config();

export async function seed() {
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Session.deleteMany({}),
    Attendance.deleteMany({}),
    Material.deleteMany({}),
  ]);

  const mentorPasswordHash = await bcrypt.hash('password123', 12);
  const studentPasswordHash = await bcrypt.hash('4SH24CS001', 12);

  const students = [
    { fullName: 'Abhishek Sharma', usn: '4SH24CS001', email: 'abhishek@forge.local', department: 'CS', batchYear: 2024, isActive: true },
    { fullName: 'Divya Kulkarni', usn: '4SH24CS002', email: 'divya@forge.local', department: 'AI', batchYear: 2024, isActive: true },
    { fullName: 'Ravi Kumar', usn: '4SH24CS003', email: 'ravi@forge.local', department: 'CS', batchYear: 2024, isActive: true },
    { fullName: 'Anjali Desai', usn: '4SH24CS004', email: 'anjali@forge.local', department: 'IS', batchYear: 2024, isActive: true },
    { fullName: 'Karthik N', usn: '4SH24CS005', email: 'karthik@forge.local', department: 'CS', batchYear: 2024, isActive: true },
  ];

  for (const student of students) {
    await Student.updateOne(
      { usn: student.usn },
      { $set: student },
      { upsert: true }
    );
  }

  const sessionDocs = [
    { date: new Date('2026-04-05T00:00:00.000Z'), topic: 'Deployment Strategies', monthNumber: 6, durationHours: 2, sessionType: 'offline', notes: 'Sample placeholder session' },
    { date: new Date('2026-04-12T00:00:00.000Z'), topic: 'Model Evaluation', monthNumber: 6, durationHours: 2, sessionType: 'offline', notes: 'Sample placeholder session' },
    { date: new Date('2026-04-19T00:00:00.000Z'), topic: 'AI Security', monthNumber: 6, durationHours: 2, sessionType: 'online', notes: 'Sample placeholder session' },
  ];

  for (const session of sessionDocs) {
    await Session.updateOne(
      { date: session.date },
      { $set: session },
      { upsert: true }
    );
  }

  const mentor = await User.findOneAndUpdate(
    { email: 'mentor@forge.local' },
    {
      $set: {
        email: 'mentor@forge.local',
        passwordHash: mentorPasswordHash,
        role: 'mentor',
        displayName: 'Nischay (Lead Mentor)',
        studentId: null,
        studentUsn: null,
        mustChangePassword: false,
      },
    },
    { upsert: true, new: true }
  );

  const [studentOne, studentTwo, studentThree] = await Student.find({ usn: { $in: ['4SH24CS001', '4SH24CS002', '4SH24CS003'] } }).sort({ usn: 1 });
  const [sessionOne, sessionTwo, sessionThree] = await Session.find().sort({ date: 1 });

  const attendanceRows = [
    { studentId: studentOne._id, sessionId: sessionOne._id, status: 'present', markedBy: mentor._id, importLabel: 'sample_seed' },
    { studentId: studentTwo._id, sessionId: sessionOne._id, status: 'present', markedBy: mentor._id, importLabel: 'sample_seed' },
    { studentId: studentThree._id, sessionId: sessionOne._id, status: 'absent', markedBy: mentor._id, importLabel: 'sample_seed' },
    { studentId: studentOne._id, sessionId: sessionTwo._id, status: 'present', markedBy: mentor._id, importLabel: 'sample_seed' },
    { studentId: studentTwo._id, sessionId: sessionTwo._id, status: 'absent', markedBy: mentor._id, importLabel: 'sample_seed' },
    { studentId: studentThree._id, sessionId: sessionTwo._id, status: 'present', markedBy: mentor._id, importLabel: 'sample_seed' },
    { studentId: studentOne._id, sessionId: sessionThree._id, status: 'absent', markedBy: mentor._id, importLabel: 'sample_seed' },
    { studentId: studentTwo._id, sessionId: sessionThree._id, status: 'present', markedBy: mentor._id, importLabel: 'sample_seed' },
    { studentId: studentThree._id, sessionId: sessionThree._id, status: 'present', markedBy: mentor._id, importLabel: 'sample_seed' },
  ];

  for (const row of attendanceRows) {
    await Attendance.updateOne(
      { studentId: row.studentId, sessionId: row.sessionId },
      { $set: row },
      { upsert: true }
    );
  }

  await Material.updateOne(
    { title: 'Deployment Strategies Slides' },
    {
      $set: {
        sessionId: sessionOne._id,
        title: 'Deployment Strategies Slides',
        type: 'slides',
        url: 'https://example.com/deployment-strategies-slides',
        description: 'Sample placeholder material',
      },
    },
    { upsert: true }
  );

  await User.updateOne(
    { email: 'student@forge.local' },
    {
      $set: {
        email: 'student@forge.local',
        passwordHash: studentPasswordHash,
        role: 'student',
        displayName: 'Abhishek Sharma',
        studentId: studentOne._id,
        studentUsn: '4SH24CS001',
        mustChangePassword: true,
      },
    },
    { upsert: true }
  );

  console.log('Seeded ForgeTrack sample database records.');
}

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename || process.argv[1]?.endsWith('seed.js')) {
  await connectDatabase();
  seed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
