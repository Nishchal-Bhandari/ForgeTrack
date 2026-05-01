import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function serializeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.displayName,
    student_id: user.studentId,
    student_usn: user.studentUsn,
    profile_image: user.profileImage,
    theme: user.theme,
    must_change_password: user.mustChangePassword,
    last_login_at: user.lastLoginAt,
  };
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign(
    {
      role: user.role,
      studentId: user.studentId,
      mustChangePassword: user.mustChangePassword,
    },
    secret,
    {
      subject: user._id.toString(),
      expiresIn: '7d',
    }
  );
}

router.post('/login', async (req, res) => {
  console.log('LOGIN REQUEST RECEIVED:', req.body?.identifier);
  const { role, identifier, password } = req.body ?? {};

  if (!role || !identifier || !password) {
    return res.status(400).json({ error: 'Role, identifier, and password are required.' });
  }

  const normalizedIdentifier = String(identifier).trim();
  const emailIdentifier = normalizedIdentifier.toLowerCase();

  const query = role === 'student'
    ? {
        role: 'student',
        $or: [
          { studentUsn: normalizedIdentifier.toUpperCase() },
          { email: emailIdentifier },
        ],
      }
    : {
        role: 'mentor',
        email: emailIdentifier,
      };

  const user = await User.findOne(query);

  if (!user) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  return res.json({ token, user: serializeUser(user) });
});

router.get('/me', requireAuth, async (req, res) => {
  return res.json({ user: serializeUser(req.auth.user) });
});

router.post('/change-password', requireAuth, async (req, res) => {
  const { newPassword } = req.body ?? {};
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const user = req.auth.user;
  user.passwordHash = await bcrypt.hash(String(newPassword), 12);
  user.mustChangePassword = false;
  await user.save();

  return res.json({ user: serializeUser(user) });
});

// Update Profile (Name/Image)
router.post('/update-profile', requireAuth, async (req, res) => {
  const { displayName, profileImage } = req.body;
  const user = req.auth.user;

  if (displayName) user.displayName = displayName;
  if (profileImage !== undefined) user.profileImage = profileImage;

  await user.save();
  return res.json({ user: serializeUser(user) });
});

// Update Settings (Theme)
router.post('/update-settings', requireAuth, async (req, res) => {
  const { theme } = req.body;
  const user = req.auth.user;

  if (theme) user.theme = theme;

  await user.save();
  return res.json({ user: serializeUser(user) });
});

export default router;
