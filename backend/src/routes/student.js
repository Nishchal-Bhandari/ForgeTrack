import express from 'express';
import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Middleware: Ensure user is student
function ensureStudent(req, res, next) {
  if (req.auth.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can access this' });
  }
  next();
}

// GET /api/student/me - Get student's own record
router.get('/me', requireAuth, ensureStudent, async (req, res) => {
  try {
    const student = await Student.findOne({ authUserId: req.auth.user._id })
      .populate('mentorId', 'displayName email');

    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    return res.json({ student: student.toObject() });
  } catch (error) {
    console.error('Error fetching student record:', error);
    return res.status(500).json({ error: 'Failed to fetch student record' });
  }
});

// GET /api/student/attendance-stats - Get attendance statistics
router.get('/attendance-stats', requireAuth, ensureStudent, async (req, res) => {
  try {
    const student = await Student.findOne({ authUserId: req.auth.user._id });

    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const totalSessions = await Session.countDocuments();
    const attendance = await Attendance.find({ studentId: student._id }).populate('sessionId');

    const presentCount = attendance.filter((a) => a.status === 'present').length;
    const absentCount = attendance.filter((a) => a.status === 'absent').length;
    const attendancePercentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    // Calculate current streak
    const sortedAttendance = attendance
      .sort((a, b) => new Date(b.markedAt) - new Date(a.markedAt))
      .slice(0, 10);

    let currentStreak = 0;
    for (const record of sortedAttendance) {
      if (record.status === 'present') {
        currentStreak++;
      } else {
        break;
      }
    }

    return res.json({
      stats: {
        attendancePercentage,
        sessionsMissed: absentCount,
        sessionsAttended: presentCount,
        currentStreak,
        totalSessions,
      },
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return res.status(500).json({ error: 'Failed to fetch attendance stats' });
  }
});

// GET /api/student/attendance-history - Get attendance history with pagination
router.get('/attendance-history', requireAuth, ensureStudent, async (req, res) => {
  try {
    const { page = 1, limit = 15, month } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const student = await Student.findOne({ authUserId: req.auth.user._id });

    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    let query = { studentId: student._id };

    // Filter by month if provided (format: YYYY-MM)
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, parseInt(monthNum) - 1, 1);
      const endDate = new Date(year, parseInt(monthNum), 0, 23, 59, 59);
      query.markedAt = { $gte: startDate, $lte: endDate };
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('sessionId', 'date topic duration_hours')
      .sort({ markedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      history: records.map((record) => ({
        date: record.sessionId.date,
        topic: record.sessionId.topic,
        status: record.status,
        duration: record.sessionId.duration_hours,
        markedAt: record.markedAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    return res.status(500).json({ error: 'Failed to fetch attendance history' });
  }
});

// GET /api/student/heatmap - Get 6-month attendance heatmap data
router.get('/heatmap', requireAuth, ensureStudent, async (req, res) => {
  try {
    const student = await Student.findOne({ authUserId: req.auth.user._id });

    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    // Get last 6 months of data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const attendance = await Attendance.find({
      studentId: student._id,
      markedAt: { $gte: sixMonthsAgo },
    }).populate('sessionId', 'date');

    // Group by date
    const heatmapData = {};
    attendance.forEach((record) => {
      const dateStr = new Date(record.sessionId.date).toISOString().split('T')[0];
      heatmapData[dateStr] = record.status === 'present' ? 'present' : 'absent';
    });

    return res.json({ heatmap: heatmapData });
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    return res.status(500).json({ error: 'Failed to fetch heatmap' });
  }
});

// PUT /api/student/profile - Update student phone and profile info
router.put('/profile', requireAuth, ensureStudent, async (req, res) => {
  try {
    const { phone } = req.body;

    const student = await Student.findOne({ authUserId: req.auth.user._id });

    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    if (phone !== undefined) {
      student.phone = phone;
    }

    await student.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      student: student.toObject(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
