import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { requireAuth } from '../middleware/auth.js';

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
        const totalSessions = 0; // Will be fetched from sessions
        const attendanceRecords = await Attendance.countDocuments({ studentId: student._id });
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

    // Validate input
    if (!fullName || !usn || !email || !department || !batchYear) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (String(password).length < 6) {
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

export default router;
