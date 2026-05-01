import express from 'express';
import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { Material } from '../models/Material.js';
import { Notification } from '../models/Notification.js';
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

// GET /api/student/upcoming-session - Get next scheduled session
router.get('/upcoming-session', requireAuth, ensureStudent, async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const upcoming = await Session.findOne({ date: { $gte: today } })
      .sort({ date: 1 });

    return res.json({ session: upcoming });
  } catch (error) {
    console.error('Error fetching upcoming session:', error);
    return res.status(500).json({ error: 'Failed to fetch upcoming session' });
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

// GET /api/student/materials - Get all materials
router.get('/materials', requireAuth, ensureStudent, async (req, res) => {
  try {
    const materials = await Material.find().populate('sessionId', 'topic date');
    return res.json({ materials });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// GET /api/student/notifications - Get student's notifications
router.get('/notifications', requireAuth, ensureStudent, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.auth.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/student/notifications/:id/read - Mark notification as read
router.post('/notifications/:id/read', requireAuth, ensureStudent, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.user._id },
      { isRead: true }
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// POST /api/student/notifications/read-all - Mark all as read
router.post('/notifications/read-all', requireAuth, ensureStudent, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.auth.user._id, isRead: false },
      { isRead: true }
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

export default router;

