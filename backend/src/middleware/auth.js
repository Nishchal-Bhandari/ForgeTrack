import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

function getTokenFromHeader(header) {
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Missing authentication token.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured.' });
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({ error: 'Account not found.' });
    }

    req.auth = { user, token };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Session expired or invalid.' });
  }
}

export function requireMentor(req, res, next) {
  if (!req.auth || req.auth.user.role !== 'mentor') {
    return res.status(403).json({ error: 'Forbidden. Mentor access required.' });
  }
  next();
}

export function requireStudent(req, res, next) {
  if (!req.auth || req.auth.user.role !== 'student') {
    return res.status(403).json({ error: 'Forbidden. Student access required.' });
  }
  next();
}

