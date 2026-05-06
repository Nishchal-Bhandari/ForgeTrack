import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Session } from '../models/Session.js';
import { Attendance } from '../models/Attendance.js';
import { Material as MaterialModel } from '../models/Material.js';
import { Notification } from '../models/Notification.js';
import { requireAuth, requireMentor } from '../middleware/auth.js';

const router = express.Router();

// Middleware: Ensure user is mentor
function ensureMentor(req, res, next) {
  if (req.auth.user.role !== 'mentor') {
    return res.status(403).json({ error: 'Only mentors can perform this action' });
  }
  next();
}

// GET /api/mentor/students - List all students for this mentor
router.get('/students', requireAuth, ensureMentor, async (req, res) => {
  try {
    const students = await Student.find({ mentorId: req.auth.user._id })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    // Enrich with attendance statistics
    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const today = new Date();
        const totalSessions = await Session.countDocuments({ date: { $lte: today } });
        const presentCount = await Attendance.countDocuments({ studentId: student._id, status: 'present' });

        return {
          ...student.toObject(),
          attendancePercentage: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0,
        };
      })
    );

    return res.json({ students: enrichedStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST /api/mentor/add-student - Add a new student
router.post('/add-student', requireAuth, ensureMentor, async (req, res) => {
  try {
    const { fullName, usn, email, department, phone, batchYear, username, password, confirmPassword } = req.body;
    console.log('DEBUG: add-student request body:', req.body);

    // Validate input
    if (!fullName || !usn || !email || !department || !batchYear) {
      console.log('DEBUG: Validation failed - Missing fields:', { fullName: !!fullName, usn: !!usn, email: !!email, department: !!department, batchYear: !!batchYear });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      console.log('DEBUG: Validation failed - Passwords mismatch');
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (String(password).length < 6) {
      console.log('DEBUG: Validation failed - Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check for duplicate USN or email
    const existingUsn = await Student.findOne({ usn: usn.toUpperCase() });
    if (existingUsn) {
      return res.status(400).json({ error: 'USN already exists', field: 'usn' });
    }

    const existingEmail = await Student.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists', field: 'email' });
    }

    // Check for duplicate user email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered', field: 'email' });
    }

    // Create auth user
    const passwordHash = await bcrypt.hash(String(password), 12);
    const authUser = new User({
      email: email.toLowerCase(),
      passwordHash,
      role: 'student',
      displayName: fullName,
      mustChangePassword: true, // Student must change password on first login
    });
    await authUser.save();

    // Create student record
    const student = new Student({
      fullName,
      usn: usn.toUpperCase(),
      email: email.toLowerCase(),
      department,
      phone: phone || null,
      batchYear: parseInt(batchYear),
      mentorId: req.auth.user._id,
      authUserId: authUser._id,
      isActive: true,
    });
    await student.save();

    // Link student to auth user
    authUser.studentId = student._id;
    authUser.studentUsn = student.usn;
    await authUser.save();

    return res.status(201).json({
      success: true,
      message: 'Student added successfully',
      student: student.toObject(),
    });
  } catch (error) {
    console.error('Error adding student:', error);
    return res.status(500).json({ error: 'Failed to add student' });
  }
});

// DELETE /api/mentor/students/:studentId - Remove a student
router.delete('/students/:studentId', requireAuth, ensureMentor, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find student and verify ownership
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.mentorId.toString() !== req.auth.user._id.toString()) {
      return res.status(403).json({ error: 'Cannot delete students from other mentors' });
    }

    // Delete all attendance records for this student
    await Attendance.deleteMany({ studentId: student._id });

    // Delete the auth user
    if (student.authUserId) {
      await User.findByIdAndDelete(student.authUserId);
    }

    // Delete the student record
    await Student.findByIdAndDelete(studentId);

    return res.json({
      success: true,
      message: 'Student removed successfully',
    });
  } catch (error) {
    console.error('Error removing student:', error);
    return res.status(500).json({ error: 'Failed to remove student' });
  }
});

// PUT /api/mentor/students/:studentId - Update student info
router.put('/students/:studentId', requireAuth, ensureMentor, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { fullName, department, phone, batchYear } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.mentorId.toString() !== req.auth.user._id.toString()) {
      return res.status(403).json({ error: 'Cannot edit students from other mentors' });
    }

    // Update allowed fields (not USN or email)
    if (fullName) student.fullName = fullName;
    if (department) student.department = department;
    if (phone !== undefined) student.phone = phone;
    if (batchYear) student.batchYear = parseInt(batchYear);

    await student.save();

    // Also update auth user display name
    if (fullName && student.authUserId) {
      await User.findByIdAndUpdate(student.authUserId, { displayName: fullName });
    }

    return res.json({
      success: true,
      message: 'Student updated successfully',
      student: student.toObject(),
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({ error: 'Failed to update student' });
  }
});

// POST /api/mentor/students/:studentId/reset-password - Reset student password
router.post('/students/:studentId/reset-password', requireAuth, ensureMentor, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Password fields required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.mentorId.toString() !== req.auth.user._id.toString()) {
      return res.status(403).json({ error: 'Cannot reset password for students from other mentors' });
    }

    // Update auth user password
    const passwordHash = await bcrypt.hash(String(newPassword), 12);
    await User.findByIdAndUpdate(student.authUserId, {
      passwordHash,
      mustChangePassword: true,
    });

    return res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

// GET /api/mentor/students/:studentId/analytics - Get detailed analytics for a student
router.get('/students/:studentId/analytics', requireAuth, requireMentor, async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const attendance = await Attendance.find({ studentId })
      .populate('sessionId')
      .sort({ 'sessionId.date': -1 });

    const today = new Date();
    const totalSessions = await Session.countDocuments({ date: { $lte: today } });
    const presentCount = attendance.filter(a => a.status === 'present').length;
    
    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const sortedAttendance = [...attendance].sort((a, b) => new Date(a.sessionId.date) - new Date(b.sessionId.date));
    
    sortedAttendance.forEach(record => {
      if (record.status === 'present') {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    // Current streak (from most recent)
    for (const record of attendance) {
      if (record.status === 'present') {
        currentStreak++;
      } else {
        break;
      }
    }

    // Monthly breakdown
    const monthlyData = {};
    attendance.forEach(record => {
      const month = new Date(record.sessionId.date).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) monthlyData[month] = { present: 0, total: 0 };
      monthlyData[month].total++;
      if (record.status === 'present') monthlyData[month].present++;
    });

    return res.json({
      analytics: {
        attendancePercentage: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0,
        currentStreak,
        longestStreak,
        monthlyBreakdown: Object.entries(monthlyData).map(([name, counts]) => ({
          name,
          percentage: Math.round((counts.present / counts.total) * 100)
        })),
        history: attendance.map(a => ({
          date: a.sessionId.date,
          topic: a.sessionId.topic,
          status: a.status
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch student analytics' });
  }
});

// GET /api/mentor/stats - Get dashboard statistics
router.get('/stats', requireAuth, requireMentor, async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [totalStudents, totalSessions, totalAttendance] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Session.countDocuments(),
      Attendance.countDocuments({ status: 'present' })
    ]);

    // Get today's session
    const todaySession = await Session.findOne({ date: today });
    let todayStats = { present: 0, absent: 0, total: 0, sessionTopic: 'No session today' };

    if (todaySession) {
      const [present, absent] = await Promise.all([
        Attendance.countDocuments({ sessionId: todaySession._id, status: 'present' }),
        Attendance.countDocuments({ sessionId: todaySession._id, status: 'absent' })
      ]);
      
      const absentStudents = await Attendance.find({ sessionId: todaySession._id, status: 'absent' })
        .populate('studentId', 'fullName usn')
        .limit(5);

      todayStats = {
        present,
        absent,
        total: present + absent,
        sessionTopic: todaySession.topic,
        absentStudents: absentStudents.map(a => a.studentId)
      };
    }

    // Calculate program average
    const avgAttendance = totalSessions > 0 ? (totalAttendance / (totalStudents * totalSessions)) * 100 : 0;

    return res.json({
      stats: {
        totalStudents,
        totalSessions,
        avgAttendance: Math.round(avgAttendance),
        today: todayStats
      }
    });
  } catch (error) {
    console.error('Error fetching mentor stats:', error);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/mentor/sessions/:date - Get or create a session for a date
router.get('/sessions/:date', requireAuth, requireMentor, async (req, res) => {
  try {
    const { date } = req.params;
    const sessionDate = new Date(date);
    sessionDate.setUTCHours(0, 0, 0, 0);

    let session = await Session.findOne({ date: sessionDate });
    
    if (!session) {
      // Create a default session if it doesn't exist
      session = new Session({
        date: sessionDate,
        topic: 'New Session',
        monthNumber: Math.floor(sessionDate.getMonth() + 1), // Simplistic month calc
        durationHours: 2,
        sessionType: 'offline',
      });
      await session.save();
    }

    return res.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    return res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// GET /api/mentor/sessions/:sessionId/attendance - Get attendance for a session
router.get('/sessions/:sessionId/attendance', requireAuth, requireMentor, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const students = await Student.find({ isActive: true }).sort({ fullName: 1 });
    const attendanceRecords = await Attendance.find({ sessionId });

    const attendanceMap = {};
    attendanceRecords.forEach(rec => {
      attendanceMap[rec.studentId.toString()] = rec.status;
    });

    const studentList = students.map(student => ({
      _id: student._id,
      fullName: student.fullName,
      usn: student.usn,
      department: student.department,
      status: attendanceMap[student._id.toString()] || null
    }));

    return res.json({ students: studentList });
  } catch (error) {
    console.error('Error fetching attendance list:', error);
    return res.status(500).json({ error: 'Failed to fetch attendance list' });
  }
});

// POST /api/mentor/sessions/:sessionId/attendance - Save attendance for a session
router.post('/sessions/:sessionId/attendance', requireAuth, requireMentor, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { attendance, topic } = req.body;

    // Update session topic if provided
    if (topic) {
      await Session.findByIdAndUpdate(sessionId, { topic });
    }

    const operations = attendance.map(item => ({
      updateOne: {
        filter: { studentId: item.studentId, sessionId },
        update: { 
          $set: { 
            status: item.status, 
            markedBy: req.auth.user._id,
            markedAt: new Date()
          } 
        },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await Attendance.bulkWrite(operations);
    }

    return res.json({ success: true, message: 'Attendance saved successfully' });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return res.status(500).json({ error: 'Failed to save attendance' });
  }
});

// GET /api/mentor/materials - Get all materials
router.get('/materials', requireAuth, requireMentor, async (req, res) => {
  try {
    const materials = await MaterialModel.find().populate('sessionId', 'topic date');
    return res.json({ materials });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// POST /api/mentor/materials - Create a material
router.post('/materials', requireAuth, requireMentor, async (req, res) => {
  try {
    const { sessionId, title, type, url, description } = req.body;
    const material = new MaterialModel({ sessionId, title, type, url, description });
    await material.save();

    // Notify all students
    const students = await User.find({ role: 'student' });
    const session = await Session.findById(sessionId);
    const notifications = students.map(student => ({
      userId: student._id,
      title: 'New Study Material',
      message: `A new material "${title}" has been added for session: ${session?.topic || 'General'}.`,
      type: 'info',
      link: '/materials'
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return res.status(201).json({ material });
  } catch (error) {
    console.error('Error creating material:', error);
    return res.status(500).json({ error: 'Failed to create material' });
  }
});

// DELETE /api/mentor/materials/:id - Delete a material
router.delete('/materials/:id', requireAuth, requireMentor, async (req, res) => {
  try {
    const { id } = req.params;
    await MaterialModel.findByIdAndDelete(id);
    return res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    return res.status(500).json({ error: 'Failed to delete material' });
  }
});

import { analyzeCSV } from '../services/gemini.js';
import { ImportLog } from '../models/ImportLog.js';

// POST /api/mentor/import/analyze - Analyze CSV snippet with Gemini
router.post('/import/analyze', requireAuth, requireMentor, async (req, res) => {
  try {
    const { csvSnippet } = req.body;
    if (!csvSnippet) return res.status(400).json({ error: 'No CSV data provided' });
    
    const analysis = await analyzeCSV(csvSnippet);
    return res.json({ analysis });
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return res.status(500).json({ error: 'AI Analysis failed', message: error.message });
  }
});

// POST /api/mentor/import/execute - Execute batch import
router.post('/import/execute', requireAuth, requireMentor, async (req, res) => {
  try {
    const { filename, data, mapping } = req.body;
    
    let importedRows = 0;
    let skippedRows = 0;
    const warnings = [];

    const importLog = new ImportLog({
      filename,
      uploadedBy: req.auth.user._id,
      totalRows: data.length,
      importedRows: 0,
      skippedRows: 0,
      columnMapping: mapping
    });

    for (const row of data) {
      try {
        const usn = row[mapping.usn];
        const fullName = row[mapping.fullName];
        
        if (!usn || !fullName) {
          skippedRows++;
          warnings.push(`Skipped row: Missing USN or Name`);
          continue;
        }

        // Upsert student
        await Student.findOneAndUpdate(
          { usn },
          {
            fullName,
            department: row[mapping.department] || 'Unknown',
            batchYear: parseInt(row[mapping.batchYear]) || new Date().getFullYear(),
            isActive: true
          },
          { upsert: true, new: true }
        );
        
        importedRows++;
      } catch (err) {
        skippedRows++;
        warnings.push(`Error on row: ${err.message}`);
      }
    }

    importLog.importedRows = importedRows;
    importLog.skippedRows = skippedRows;
    importLog.warnings = warnings;
    importLog.status = skippedRows === 0 ? 'completed' : 'partial';
    await importLog.save();

    return res.json({
      success: true,
      importedRows,
      skippedRows,
      warnings
    });
  } catch (error) {
    console.error('Import execution failed:', error);
    return res.status(500).json({ error: 'Import failed' });
  }
});

export default router;


